from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from dbConnection import db
from models import Projetos, Grupos
from utils.uploadS3 import upload_file_to_s3, delete_file_from_s3

projetos_bp = Blueprint('projetos_bp', __name__)

@projetos_bp.route("/projects/add", methods=["POST"])
def add():
    nomeProjeto = request.form.get("nomeProjeto")
    localizacao = request.form.get("localizacao")
    dataInicio = request.form.get("dataInicio")
    dataFim = request.form.get("dataFim")
    nomeGrupo = request.form.get("nomeGrupo")
    imagemInicial = request.files.get("imagemInicial")  # <- Arquivo vem aqui

    grupo = Grupos.query.filter_by(nomeGrupo=nomeGrupo).first()
    # Verifica se o grupo existe
    if not grupo:
        return jsonify({'message': 'Grupo não encontrado'}), 400

    # Verifica se já existe projeto com mesmo nome no grupo
    if Projetos.query.filter_by(nomeProjeto=nomeProjeto, grupoID=grupo.grupoID).first():
        return jsonify({'message': 'Projeto já existe'}), 400

    # Verifica se arquivo foi enviado
    if not imagemInicial:
        return jsonify({'message': 'Imagem inicial é obrigatória'}), 400

    # Converte datas (espera formato YYYY-MM-DD)
    try:
        dataInicio_date = datetime.strptime(dataInicio, "%Y-%m-%d").date() if dataInicio else None
        dataFim_date = datetime.strptime(dataFim, "%Y-%m-%d").date() if dataFim else None
    except Exception as e:
        return jsonify({'message': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400

    # Tenta fazer upload e captura erros
    try:
        imagem_url = upload_file_to_s3(imagemInicial, folder="projetos")
    except Exception as e:
        return jsonify({'message': f'Erro ao enviar imagem: {str(e)}'}), 500

    novo_projeto = Projetos(
        grupoID=grupo.grupoID,
        nomeProjeto=nomeProjeto,
        localizacao=localizacao,
        dataInicio=dataInicio_date,
        dataFim=dataFim_date,
        imagemInicial=imagem_url
    )

    # Salva no banco com tratamento de exceção
    try:
        db.session.add(novo_projeto)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao salvar projeto: {str(e)}'}), 500

    return jsonify({'message': f'Projeto {nomeProjeto} cadastrado com sucesso!'}), 201

@projetos_bp.route("/projects/remove/<int:projetoID>", methods=["DELETE"])
def remove(projetoID):
    
    projeto = Projetos.query.filter_by(projetoID=projetoID).first()

    if not projeto:
        return jsonify({"message": "Projeto não encontrado"}), 404
    
    if projeto.imagemInicial:
        delete_file_from_s3(projeto.imagemInicial)

    # Remover imagens de progresso associadas no S3 (se existirem)
    try:
        from models import ImagensProgresso
        imagens = ImagensProgresso.query.filter_by(projetoID=projetoID).all()
        for img in imagens:
            if img.caminhoImagem:
                try:
                    delete_file_from_s3(img.caminhoImagem)
                except Exception as e:
                    print('Erro ao deletar imagem de progresso do S3:', e)
    except Exception as e:
        print('Erro ao tentar deletar imagens de progresso:', e)

    db.session.delete(projeto)
    db.session.commit()

    return jsonify({"message": "Projeto removido com sucesso"}), 200

@projetos_bp.route("/projects/show/<int:projetoID>", methods=["GET"])
def show_projeto(projetoID):

    projeto = Projetos.query.filter_by(projetoID=projetoID).first()

    if not projeto:
        return jsonify({"message": "Projeto não encontrado"}), 404

    # Pega as imagens de progresso
    imagens_progresso = [
        {
            "imagemID": img.imagemID,
            "caminhoImagem": img.caminhoImagem,
            "porcentagem": img.porcentagem
        }
        for img in projeto.imagens_progresso
    ]

    max_progress = None
    if imagens_progresso:
        max_progress = max([p["porcentagem"] or 0 for p in imagens_progresso])

    result = {
        "projetoID": projeto.projetoID,
        "nomeProjeto": projeto.nomeProjeto,
        "localizacao": projeto.localizacao,
        "dataInicio": projeto.dataInicio.strftime("%Y-%m-%d") if projeto.dataInicio else None,
        "dataFim": projeto.dataFim.strftime("%Y-%m-%d") if projeto.dataFim else None,
        "imagemInicial": projeto.imagemInicial,
        "imagensProgresso": imagens_progresso,
        # compatibilidade
        "id": str(projeto.projetoID),
        "name": projeto.nomeProjeto,
        "location": projeto.localizacao,
        "period": f"{projeto.dataInicio.strftime('%Y-%m-%d') if projeto.dataInicio else ''} - {projeto.dataFim.strftime('%Y-%m-%d') if projeto.dataFim else ''}",
        "group": projeto.grupo.nomeGrupo if projeto.grupo else None,
        "progress": max_progress if max_progress is not None else 0,
        "image": projeto.imagemInicial,
        "progressHistory": [
            {
                "id": str(img.imagemID),
                "image": img.caminhoImagem,
                "progress": img.porcentagem,
                "createdAt": img.dataEnvio.strftime('%Y-%m-%d %H:%M:%S') if img.dataEnvio else None,
            }
            for img in projeto.imagens_progresso
        ],
        "createdAt": projeto.dataInicio.strftime('%Y-%m-%d') if projeto.dataInicio else None,
    }

    return jsonify(result), 200


@projetos_bp.route("/projects", methods=["GET"])
def list_projects():
    # Opcionalmente filtrar por grupo
    nomeGrupo = request.args.get('nomeGrupo')
    if nomeGrupo:
        projetos = Projetos.query.join(Projetos.grupo).filter(Grupos.nomeGrupo == nomeGrupo).order_by(Projetos.projetoID.desc()).all()
    else:
        projetos = Projetos.query.order_by(Projetos.projetoID.desc()).all()

    result = []
    for projeto in projetos:
        imagens_progresso = [
            {
                "imagemID": img.imagemID,
                "caminhoImagem": img.caminhoImagem,
                "porcentagem": img.porcentagem,
                "dataEnvio": img.dataEnvio.strftime("%Y-%m-%d %H:%M:%S") if img.dataEnvio else None,
            }
            for img in projeto.imagens_progresso
        ]

        # compatibilidade com shape antigo do frontend
        max_progress = None
        if imagens_progresso:
            max_progress = max([p["porcentagem"] or 0 for p in imagens_progresso])

        result.append({
            "projetoID": projeto.projetoID,
            "nomeProjeto": projeto.nomeProjeto,
            "localizacao": projeto.localizacao,
            "dataInicio": projeto.dataInicio.strftime("%Y-%m-%d") if projeto.dataInicio else None,
            "dataFim": projeto.dataFim.strftime("%Y-%m-%d") if projeto.dataFim else None,
            "imagemInicial": projeto.imagemInicial,
            "imagensProgresso": imagens_progresso,
            # campos compatíveis com frontend antigo
            "id": str(projeto.projetoID),
            "name": projeto.nomeProjeto,
            "location": projeto.localizacao,
            "period": f"{projeto.dataInicio.strftime('%Y-%m-%d') if projeto.dataInicio else ''} - {projeto.dataFim.strftime('%Y-%m-%d') if projeto.dataFim else ''}",
            "group": projeto.grupo.nomeGrupo if projeto.grupo else None,
            "progress": max_progress if max_progress is not None else 0,
            "image": projeto.imagemInicial,
            "progressHistory": [
                {
                    "id": str(img.imagemID),
                    "image": img.caminhoImagem,
                    "progress": img.porcentagem,
                    "createdAt": img.dataEnvio.strftime('%Y-%m-%d %H:%M:%S') if img.dataEnvio else None,
                }
                for img in projeto.imagens_progresso
            ],
            "createdAt": projeto.dataInicio.strftime('%Y-%m-%d') if projeto.dataInicio else None,
        })

    return jsonify({"projetos": result}), 200

@projetos_bp.route("/projects/change/<int:projetoID>", methods=["PUT"])
def change_projeto(projetoID):
    projeto = Projetos.query.filter_by(projetoID=projetoID).first()

    if not projeto:
        return jsonify({"message": "Projeto não encontrado"}), 404

    data = request.json

    projeto.dataFim = data.get("dataFim", projeto.dataFim)

    db.session.commit()

    return jsonify({"message": "Projeto atualizado com sucesso"}), 200

from flask import Blueprint, request, jsonify
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

    if Projetos.query.filter_by(nomeProjeto=nomeProjeto, grupoID=grupo.grupoID).first():
        return jsonify({'message': 'Projeto já existe'}), 400
    
    imagem_url = upload_file_to_s3(imagemInicial, folder="projetos")
    
    novo_projeto = Projetos(
        grupoID=grupo.grupoID,
        nomeProjeto=nomeProjeto,
        localizacao=localizacao,
        dataInicio=dataInicio,
        dataFim=dataFim,
        imagemInicial=imagem_url
    )

    # Salva no banco
    db.session.add(novo_projeto)
    db.session.commit()

    return jsonify({'message': f'Projeto {nomeProjeto} cadastrado com sucesso!'}), 201

@projetos_bp.route("/projects/remove/<int:projetoID>", methods=["POST"])
def remove(projetoID):
    
    projeto = Projetos.query.filter_by(projetoID=projetoID).first()

    if not projeto:
        return jsonify({"message": "Projeto não encontrado"}), 404
    
    if projeto.imagemInicial:
        delete_file_from_s3(projeto.imagemInicial)

    # --- remover imagens de progresso (se quiser futuramente) ---
    # exemplo: ImagensProgresso.query.filter_by(projetoID=projetoID).delete()

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
            "url": img.caminhoImagem,
            "descricao": img.descricao,
            "dataEnvio": img.dataEnvio.strftime("%Y-%m-%d %H:%M:%S") if img.dataEnvio else None
        }
        for img in projeto.imagens_progresso
    ]

    return jsonify({
        "projetoID": projeto.projetoID,
        "nomeProjeto": projeto.nomeProjeto,
        "localizacao": projeto.localizacao,
        "dataInicio": projeto.dataInicio.strftime("%Y-%m-%d"),
        "dataFim": projeto.dataFim.strftime("%Y-%m-%d"),
        "imagemInicial": projeto.imagemInicial,
        "imagensProgresso": imagens_progresso
    }), 200

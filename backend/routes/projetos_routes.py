from flask import Blueprint, request, jsonify
from dbConnection import db
from models import Projetos, Grupos
from utils.uploadS3 import upload_file_to_s3

projetos_bp = Blueprint('projetos_bp', __name__)

@projetos_bp.route("/projects/add", methods=["POST"])
def add():
    # data = request.get_json()

    # imagemInicial = data.get("imagemInicial")
    # nomeProjeto = data.get("nomeProjeto")
    # localizacao = data.get("localizacao")
    # dataInicio = data.get("dataInicio")
    # dataFim = data.get("dataFim")
    # nomeGrupo = data.get("nomeGrupo")

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


    # imagem_bytes = None
    # if imagemInicial:
    #     imagem_bytes = base64.b64decode(imagemInicial.split(",")[1])

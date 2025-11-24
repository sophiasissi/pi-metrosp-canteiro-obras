from flask import Blueprint, request, jsonify
from dbConnection import db
from models import Projetos, ImagensProgresso
from utils.uploadS3 import upload_file_to_s3, delete_file_from_s3
from comparador_imagem import comparar_formas
import requests
import tempfile
import os
from datetime import datetime

imagens_progresso_bp = Blueprint('imagens_progresso_bp', __name__)

@imagens_progresso_bp.route("/progress/upload/<int:projetoID>", methods=["POST"])
def upload_progress_image(projetoID):  
    # 1 — Buscar o projeto
    projeto = Projetos.query.filter_by(projetoID=projetoID).first()
    if not projeto:
        return jsonify({"message": "Projeto não encontrado"}), 404

    if not projeto.imagemInicial:
        return jsonify({"message": "Projeto não possui imagem inicial"}), 400

    # 2 — Receber a imagem enviada pelo usuário
    caminhoImagem = request.files.get("caminhoImagem")
    if not caminhoImagem:
        return jsonify({"message": "Nenhuma imagem enviada"}), 400

    temp_ref = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_real = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")

    try:
            # 4 — Baixar a imagem inicial do projeto
            response = requests.get(projeto.imagemInicial)
            temp_ref.write(response.content)
            temp_ref.close()

            # 5 — Salvar a imagem enviada pelo usuário temporariamente
            caminhoImagem.save(temp_real.name)
            temp_real.close()

            # 6 — Comparar imagens usando OpenCV
            porcentagem = comparar_formas(temp_ref.name, temp_real.name)
            porcentagem = round(porcentagem, 2)

            # 7 — Fazer upload da imagem do progresso no S3
            imagem_url = upload_file_to_s3(caminhoImagem, folder="progresso")

            # 8 — Registrar no banco
            novo_registro = ImagensProgresso(
                projetoID=projetoID,
                porcentagem=porcentagem,
                dataEnvio=datetime.now(),
                caminhoImagem=imagem_url
            )

            db.session.add(novo_registro)
            db.session.commit()

            # 9 — Retornar resultado
            return jsonify({
                "message": "Imagem de progresso adicionada com sucesso",
                "porcentagem": porcentagem,
                "caminhoImagem": imagem_url
            }), 201

    finally:
        # 10 — Remover arquivos temporários
        os.unlink(temp_ref.name)
        os.unlink(temp_real.name)

@imagens_progresso_bp.route("/progress/delete/<int:imagemID>", methods=["DELETE"])
def delete_progress_image(imagemID):
    imagem = ImagensProgresso.query.filter_by(imagemID=imagemID).first()

    if not imagem:
        return jsonify({"message": "Imagem não encontrada"}), 404

    # 2. Deleta do S3 (se existir caminho)
    if imagem.caminhoImagem:
        try:
            delete_file_from_s3(imagem.caminhoImagem)
        except Exception as e:
            print("Erro ao deletar do S3:", e)

    # 3. Deleta do banco
    db.session.delete(imagem)
    db.session.commit()

    return jsonify({"message": "Imagem de progresso removida com sucesso"}), 200
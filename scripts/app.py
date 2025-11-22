from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection
import base64

app = Flask(__name__)
CORS(app)

@app.route("/projetos", methods=["POST"])
def criar_projeto():
    data = request.get_json()

    grupo = data.get("group")
    nome = data.get("name")
    local = data.get("location")
    data_inicio = data.get("startDate")
    data_fim = data.get("endDate")
    imagem_base64 = data.get("image")

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # converte imagem base64 para bytes
        imagem_bytes = None
        if imagem_base64:
            imagem_bytes = base64.b64decode(imagem_base64.split(",")[1])

        query = """
            INSERT INTO projeto (Grupo, NomeProjeto, Localizacao, DataInicio, DataFim, ImagemInicial)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (grupo, nome, local, data_inicio, data_fim, imagem_bytes))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Projeto criado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

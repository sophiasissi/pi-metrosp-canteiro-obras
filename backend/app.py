from flask import Flask, request, jsonify, send_from_directory
from dbConnection import init_app, db
from models import *
from flask_cors import CORS
from routes.usuarios_routes import usuarios_bp
from routes.projetos_routes import projetos_bp
from routes.imagensProgresso_routes import imagens_progresso_bp
import os

app = Flask(__name__)
CORS(app)
init_app(app)


@app.route('/')
def index():
    return {'message': 'Conexão com o banco funcionando!'}

# Servir arquivos uploadados localmente
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(upload_folder, filename)


app.register_blueprint(usuarios_bp, url_prefix='/api')
app.register_blueprint(projetos_bp, url_prefix='/api')
app.register_blueprint(imagens_progresso_bp, url_prefix='/api')


if __name__ == '__main__':
    app.run(debug=True)


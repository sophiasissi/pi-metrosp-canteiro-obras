from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dbConnection import init_app, db
from models import Usuarios, Grupos

app = Flask(__name__)
CORS(app)
init_app(app)

@app.route('/')
def index():
    return {'message': 'Conexão com o banco funcionando!'}

@app.route('/api/user/login', methods=['POST'])
def login():
    data = request.json
    cpf = data.get('cpf')
    senha = data.get('senha')

    # Procura o usuário no banco pelo CPF
    usuario = Usuarios.query.filter_by(cpf=cpf).first()
    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    # Verifica se a senha está correta
    if not usuario.check_password(senha):
        return jsonify({'message': 'Senha incorreta'}), 401

    # Login bem-sucedido
    return jsonify({
        'message': f'Login realizado com sucesso!',
        'usuario': {
            'usuarioID': usuario.usuarioID,
            'nomeCompleto': usuario.nomeCompleto,
            'cpf': usuario.cpf,
            'grupoID': usuario.grupoID,
            'adm': usuario.adm
        }
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    print("🚀 Servidor Flask iniciado!")
    print("📍 Endpoint de login: http://127.0.0.1:5000/api/user/login")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
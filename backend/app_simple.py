from flask import Flask, request, jsonify
from dbConnection import init_app, db
from models import *
from flask_cors import CORS
from routes.usuarios_routes import usuarios_bp
# Comentando temporariamente as rotas que usam dependências externas
# from routes.projetos_routes import projetos_bp
# from routes.imagensProgresso_routes import imagens_progresso_bp

app = Flask(__name__)
CORS(app)
init_app(app)

@app.route('/')
def index():
    return {'message': 'Conexão com o banco funcionando!'}

# Registrar apenas as rotas de usuários por enquanto
app.register_blueprint(usuarios_bp, url_prefix='/api')

if __name__ == '__main__':
    with app.app_context():
        # Criar as tabelas se não existirem
        db.create_all()
    
    print("🚀 Servidor Flask iniciado!")
    print("📍 Endpoint de login: http://127.0.0.1:5000/api/user/login")
    print("📍 Endpoint de registro: http://127.0.0.1:5000/api/user/register")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
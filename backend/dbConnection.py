from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

def init_app(app):
    # Configuração direta do banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:rEd0803#@127.0.0.1:3306/pii'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    bcrypt.init_app(app)

#0.tcp.sa.ngrok.io:11501


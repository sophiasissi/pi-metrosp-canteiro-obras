# IMPORTANTE
# para o backend funcionar é necessário rodar o seguinte código primeiro:
# pip install flask
# pip install flask flask_sqlalchemy pymysql
# pip install flask-cors
# pip install flask-bcrypt


from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
# from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
# CORS(app)

def init_app(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:rEd0803#@127.0.0.1:3306/pii'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    bcrypt.init_app(app)


from dbConnection import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()  # responsável por criar e verificar hash de senha

class Usuarios(db.Model):
    __tablename__ = 'usuario'  # nome exato da tabela no banco
    pessoalID = db.Column(db.Integer, primary_key=True)
    nomeCompleto = db.Column(db.String(255), nullable = False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    senhaHash = db.Column(db.String(255), nullable=False)
    grupo = db.Column(db.String(255), nullable = False)
    adm = db.Column(db.Boolean, default = False)

    # Função para criar hash da senha
    def set_password(self, password):
        self.senhaHash = bcrypt.generate_password_hash(password).decode('utf-8')

    # Função para verificar se a senha está correta
    def check_password(self, password):
        return bcrypt.check_password_hash(self.senhaHash, password)

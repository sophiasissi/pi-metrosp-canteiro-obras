from dbConnection import db
from flask_bcrypt import Bcrypt
from sqlalchemy import CheckConstraint

bcrypt = Bcrypt()  # responsável por criar e verificar hash de senha


class Grupos(db.Model):
    __tablename__ = 'grupo'
    grupoID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nomeGrupo = db.Column(db.String(255), unique=True, nullable = False)

class Usuarios(db.Model):
    __tablename__ = 'usuario'  # nome exato da tabela no banco
    usuarioID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nomeCompleto = db.Column(db.String(255), nullable = False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    senhaHash = db.Column(db.String(255), nullable=False)
    grupoID = db.Column(db.Integer, db.ForeignKey('grupo.grupoID'))    
    adm = db.Column(db.Boolean, default = False)

    grupo = db.relationship('Grupos', backref='usuarios')  # acesso: usuario.grupo.nomeGrupo

    # Função para criar hash da senha
    def set_password(self, password):
        self.senhaHash = bcrypt.generate_password_hash(password).decode('utf-8')

    # Função para verificar se a senha está correta
    def check_password(self, password):
        return bcrypt.check_password_hash(self.senhaHash, password)
    
class Projetos(db.Model):
    __tablename__ = 'projeto'
    projetoID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    grupoID = db.Column(db.Integer, db.ForeignKey('grupo.grupoID', ondelete='CASCADE'), nullable=False)
    nomeProjeto = db.Column(db.String(255), nullable=False)
    localizacao = db.Column(db.String(255), nullable=False)
    dataInicio = db.Column(db.Date, nullable=False)
    dataFim = db.Column(db.Date, nullable=False)
    imagemInicial = db.Column(db.String(255), nullable=False)

    __table_args__ = (
        CheckConstraint('dataFim IS NULL OR dataFim >= dataInicio', name='check_datas_validas'),
    )

    grupo = db.relationship('Grupos', backref='projetos')

    def __repr__(self):
        return f'<Projeto {self.nomeProjeto}>'
    

class ImagensProgresso(db.Model):
    __tablename__ = 'imagens_progresso'
    imagemID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    projetoID = db.Column(db.Integer, db.ForeignKey('projeto.projetoID', ondelete='CASCADE'), nullable=False)
    porcentagem = db.Column(db.Integer, nullable=False)
    dataEnvio = db.Column(db.DateTime)
    caminhoImagem = db.Column(db.String(255), nullable=False)
    projeto = db.relationship('Projetos', backref='imagens_progresso')

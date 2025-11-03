from flask import Flask, request, jsonify
from dbConnection import init_app, db
from models import Usuarios

app = Flask(__name__)
init_app(app)

@app.route('/')
def index():
    return {'message': 'Conexão com o banco funcionando!'}

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json  # pega os dados enviados pelo React
    nome = data.get('nomeCompleto')
    cpf = data.get('cpf')
    senha = data.get('senha')
    confirmarSenha = data.get('confirmarSenha')
    grupo = data.get('grupo')
    adm = data.get('adm', False)  # se não enviar, assume False

    # Verifica se já existe um usuário com esse email
    if Usuarios.query.filter_by(cpf=cpf).first():
        return jsonify({'message': 'CPF já cadastrado'}), 400
    
    if senha != confirmarSenha:
        return jsonify({'message': 'Senhas diferentes'}), 400

    # Cria o usuário
    novo_usuario = Usuarios(
        nomeCompleto=nome,
        cpf=cpf,
        grupo=grupo,
        adm=adm
    )
    # Cria o hash da senha
    novo_usuario.set_password(senha)

    # Salva no banco
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({'message': f'Usuário {nome} cadastrado com sucesso!'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json  # pega os dados enviados pelo React
    cpf = data.get('cpf')
    senha = data.get('senha')

    # Procura o usuário no banco pelo email
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
            'pessoalID': usuario.pessoalID,
            'nomeCompleto': usuario.nomeCompleto,
            'cpf': usuario.cpf,
            'grupo': usuario.grupo,
            'adm': usuario.adm
        }
    }), 200


@app.route('/api/settings/show-info/<cpf>', methods = ['GET'])
def showInfo(cpf):
    usuario= Usuarios.query.filter_by(cpf=cpf).first()  # busca pelo CPF

    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'cpf': usuario.cpf,
        'nomeCompleto': usuario.nomeCompleto,
        'grupo': usuario.grupo,
        'adm': usuario.adm
    })
    
@app.route('/api/settings/change-info', methods=['PUT'])
def changeInfo():

    data = request.json
    cpf = data.get('cpf')
    
    usuario = Usuarios.query.filter_by(cpf=cpf).first()
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404

    # Atualiza o nome se mudou
    nome_completo = data.get('nomeCompleto')
    if nome_completo and nome_completo != usuario.nomeCompleto:
        usuario.nomeCompleto = nome_completo

    # Atualiza a senha apenas se veio e confirmou corretamente
    senha = data.get('senha')
    confirmar_senha = data.get('confirmarSenha')
    if senha:
        if senha != confirmar_senha:
            return jsonify({'message': 'As senhas não coincidem'}), 400
        usuario.senha = usuario.set_password(senha)

    # Atualiza grupo se mudou
    grupo = data.get('grupo')
    if grupo and grupo != usuario.grupo:
        usuario.grupo = grupo

    # Atualiza adm se mudou
    admn = data.get('adm')
    if admn is not None and admn != usuario.adm:
        usuario.adm = admn

    # Commit só se alguma coisa foi alterada
    db.session.commit()
    
    return jsonify({'message': 'Usuário atualizado com sucesso'})



if __name__ == '__main__':
    app.run(debug=True)


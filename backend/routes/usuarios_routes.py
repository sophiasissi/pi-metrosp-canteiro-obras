from flask import Blueprint, request, jsonify
from dbConnection import db
from models import Usuarios, Grupos

usuarios_bp = Blueprint('usuarios_bp', __name__)

@usuarios_bp.route('/user/register', methods=['POST'])
def register():
    data = request.json  # pega os dados enviados pelo React
    nome = data.get('nomeCompleto')
    cpf = data.get('cpf')
    senha = data.get('senha')
    confirmarSenha = data.get('confirmarSenha')
    nomeGrupo = data.get('nomeGrupo')
    adm = data.get('adm', False)  # se não enviar, assume False

    # Verifica se já existe um usuário com esse email
    if Usuarios.query.filter_by(cpf=cpf).first():
        return jsonify({'message': 'CPF já cadastrado'}), 400
    
    if senha != confirmarSenha:
        return jsonify({'message': 'Senhas diferentes'}), 400
    
    grupo = Grupos.query.filter_by(nomeGrupo=nomeGrupo).first()
    if not grupo:
        grupo = Grupos(nomeGrupo=nomeGrupo)
        db.session.add(grupo)
        db.session.commit()  # precisa commitar pra gerar o grupoID

    # Cria o usuário
    novo_usuario = Usuarios(
        nomeCompleto=nome,
        cpf=cpf,
        grupoID=grupo.grupoID,
        adm=adm
    )
    # Cria o hash da senha
    novo_usuario.set_password(senha)

    # Salva no banco
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({'message': f'Usuário {nome} cadastrado com sucesso!'}), 201

@usuarios_bp.route('/user/login', methods=['POST'])
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
            'usuarioID': usuario.usuarioID,
            'nomeCompleto': usuario.nomeCompleto,
            'cpf': usuario.cpf,
            'grupoID': usuario.grupoID,
            'adm': usuario.adm
        }
    }), 200


@usuarios_bp.route('/user/settings/show-info/<cpf>', methods = ['GET'])
def showInfo(cpf):
    usuario= Usuarios.query.filter_by(cpf=cpf).first()  # busca pelo CPF

    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'cpf': usuario.cpf,
        'nomeCompleto': usuario.nomeCompleto,
        'nomeGrupo': usuario.grupo.nomeGrupo if usuario.grupo else None,
        'adm': usuario.adm
    })
    

@usuarios_bp.route('/user/settings/change-info', methods=['PUT'])
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
    nomeGrupo = data.get('nomeGrupo')
    if nomeGrupo:
        grupo_existente = Grupos.query.filter_by(nomeGrupo=nomeGrupo).first()
        if not grupo_existente:
            # cria novo grupo se não existir
            novo_grupo = Grupos(nomeGrupo=nomeGrupo)
            db.session.add(novo_grupo)
            db.session.commit()
            usuario.grupoID = novo_grupo.grupoID
        else:
            # se já existir, apenas vincula
            if usuario.grupoID != grupo_existente.grupoID:
                usuario.grupoID = grupo_existente.grupoID

    # Atualiza adm se mudou
    admn = data.get('adm')
    if admn is not None and admn != usuario.adm:
        usuario.adm = admn

    # Commit só se alguma coisa foi alterada
    db.session.commit()
    
    return jsonify({'message': 'Usuário atualizado com sucesso'})

@usuarios_bp.route('/user/delete', methods=['DELETE'])
def delete():
    data = request.json  # pega os dados enviados pelo React
    cpf = data.get('cpf')

    usuario = Usuarios.query.filter_by(cpf=cpf).first()

    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    db.session.delete(usuario)
    db.session.commit()

    return jsonify({'message': f'Usuário {cpf} removido com sucesso!'}), 200

@usuarios_bp.route('/groups', methods=['GET'])
def list_groups():
    """Retorna todos os grupos cadastrados no sistema"""
    try:
        grupos = Grupos.query.all()
        grupos_list = [
            {
                'grupoID': grupo.grupoID,
                'nomeGrupo': grupo.nomeGrupo
            }
            for grupo in grupos
        ]
        return jsonify({'grupos': grupos_list}), 200
    except Exception as e:
        return jsonify({'error': 'Erro ao buscar grupos'}), 500

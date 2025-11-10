from flask import Blueprint, request, jsonify
from dbConnection import db
from models import Projetos, Grupos
from datetime import datetime
import base64
import uuid
import os

projetos_bp = Blueprint('projetos', __name__)

@projetos_bp.route('/projetos', methods=['POST'])
def create_projeto():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Nenhum dado enviado"}), 400
        
        # Validar campos obrigatórios
        required_fields = ['name', 'location', 'startDate', 'endDate', 'group']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo {field} é obrigatório"}), 400
        
        # Buscar o grupo pelo nome
        grupo = Grupos.query.filter_by(nomeGrupo=data['group']).first()
        if not grupo:
            return jsonify({"error": f"Grupo '{data['group']}' não encontrado"}), 404
        
        # Processar imagem se enviada
        image_binary = None
        if data.get('image'):
            try:
                # Decodificar base64
                image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
                image_binary = base64.b64decode(image_data)
                    
            except Exception as e:
                print(f"Erro ao processar imagem: {e}")
                # Continuar sem imagem se houver erro
                pass
        
        # Converter datas
        try:
            start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['endDate'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Formato de data inválido. Use YYYY-MM-DD"}), 400
        
        # Criar projeto
        novo_projeto = Projetos(
            nomeProjeto=data['name'],
            localizacao=data['location'],
            dataInicio=start_date,
            dataFim=end_date,
            grupoID=grupo.grupoID,
            imagemInicial=image_binary
        )
        
        db.session.add(novo_projeto)
        db.session.commit()
        
        return jsonify({
            "message": "Projeto criado com sucesso!",
            "projeto_id": novo_projeto.projetoID
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar projeto: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@projetos_bp.route('/projetos', methods=['GET'])
def get_projetos():
    try:
        projetos = Projetos.query.all()
        projetos_list = []
        
        for projeto in projetos:
            projetos_list.append({
                'id': projeto.projetoID,
                'nome': projeto.nomeProjeto,
                'localizacao': projeto.localizacao,
                'data_inicio': projeto.dataInicio.isoformat() if projeto.dataInicio else None,
                'data_fim': projeto.dataFim.isoformat() if projeto.dataFim else None,
                'grupo': projeto.grupo.nomeGrupo if projeto.grupo else None,
                'tem_imagem': projeto.imagemInicial is not None
            })
        
        return jsonify(projetos_list), 200
        
    except Exception as e:
        print(f"Erro ao buscar projetos: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@projetos_bp.route('/projetos/<int:projeto_id>', methods=['GET'])
def get_projeto(projeto_id):
    try:
        projeto = Projetos.query.get_or_404(projeto_id)
        
        return jsonify({
            'id': projeto.projetoID,
            'nome': projeto.nomeProjeto,
            'localizacao': projeto.localizacao,
            'data_inicio': projeto.dataInicio.isoformat() if projeto.dataInicio else None,
            'data_fim': projeto.dataFim.isoformat() if projeto.dataFim else None,
            'grupo': projeto.grupo.nomeGrupo if projeto.grupo else None,
            'tem_imagem': projeto.imagemInicial is not None
        }), 200
        
    except Exception as e:
        print(f"Erro ao buscar projeto: {e}")
        return jsonify({"error": "Projeto não encontrado"}), 404

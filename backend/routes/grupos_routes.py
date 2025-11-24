from flask import Blueprint, request, jsonify
from dbConnection import db
from models import Grupos

grupos_bp = Blueprint('grupos_bp', __name__)

@grupos_bp.route("/groups/show", methods=["GET"])
def show():
    grupos = Grupos.query.all()
    grupos_list = [{"nomeGrupo": grupo.nomeGrupo} for grupo in grupos]
    return jsonify(grupos_list), 200
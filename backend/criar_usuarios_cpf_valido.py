from flask import Flask
from dbConnection import init_app, db
from models import Usuarios, Grupos

def gerar_cpf_valido(base):
    """Gera um CPF válido baseado em uma sequência base"""
    # Usar uma base conhecida e calcular os dígitos verificadores
    cpf_base = list(map(int, base))
    
    # Calcular primeiro dígito verificador
    soma1 = sum(cpf_base[i] * (10 - i) for i in range(9))
    resto1 = soma1 % 11
    dv1 = 11 - resto1 if resto1 >= 2 else 0
    
    # Calcular segundo dígito verificador
    cpf_base.append(dv1)
    soma2 = sum(cpf_base[i] * (11 - i) for i in range(10))
    resto2 = soma2 % 11
    dv2 = 11 - resto2 if resto2 >= 2 else 0
    
    cpf_final = ''.join(map(str, cpf_base)) + str(dv2)
    return cpf_final

# Gerar CPFs válidos
cpf_admin = gerar_cpf_valido("123456789")   # Base: 123456789
cpf_user = gerar_cpf_valido("987654321")    # Base: 987654321

print(f"CPF Admin gerado: {cpf_admin}")
print(f"CPF User gerado: {cpf_user}")

# Validar os CPFs gerados
def validar_cpf(cpf):
    """Valida um CPF"""
    if len(cpf) != 11:
        return False
    
    # Calcular primeiro dígito
    soma1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto1 = soma1 % 11
    dv1 = 11 - resto1 if resto1 >= 2 else 0
    
    # Calcular segundo dígito
    soma2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto2 = soma2 % 11
    dv2 = 11 - resto2 if resto2 >= 2 else 0
    
    return int(cpf[9]) == dv1 and int(cpf[10]) == dv2

print(f"CPF Admin válido: {validar_cpf(cpf_admin)}")
print(f"CPF User válido: {validar_cpf(cpf_user)}")

# Criar aplicação Flask para inserir os usuários
app = Flask(__name__)
init_app(app)

with app.app_context():
    try:
        print("\n🚀 Removendo usuários antigos e criando novos com CPFs válidos...")
        
        # Remover usuários existentes
        Usuarios.query.delete()
        db.session.commit()
        
        # Criar usuários com CPFs válidos
        print("\n👤 Criando usuários com CPFs válidos...")
        
        # Usuário Admin
        admin = Usuarios(
            nomeCompleto="João Silva Santos",
            cpf=cpf_admin,
            grupoID=1,
            adm=True
        )
        admin.set_password("admin123")
        
        # Usuário Normal
        user = Usuarios(
            nomeCompleto="Maria Oliveira Costa", 
            cpf=cpf_user,
            grupoID=1,
            adm=False
        )
        user.set_password("user456")
        
        db.session.add(admin)
        db.session.add(user)
        db.session.commit()
        
        print("✅ Usuários criados com CPFs válidos!")
        print("\n🔑 Novas credenciais para teste:")
        print(f"Admin - CPF: {cpf_admin}, Senha: admin123")
        print(f"User - CPF: {cpf_user}, Senha: user456")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
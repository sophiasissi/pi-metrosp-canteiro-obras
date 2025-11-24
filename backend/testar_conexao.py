import pymysql

# Testar conexão direta com o banco
try:
    print("Testando conexão com MySQL...")
    
    connection = pymysql.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='579924',
        database='pii',
        charset='utf8mb4'
    )
    
    print("✅ Conexão estabelecida com sucesso!")
    
    cursor = connection.cursor()
    
    # Testar se as tabelas existem
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"\n📋 Tabelas encontradas: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Verificar dados nas tabelas
    print("\n🔍 Verificando dados existentes:")
    
    cursor.execute("SELECT COUNT(*) FROM grupo")
    grupos_count = cursor.fetchone()[0]
    print(f"  - Grupos: {grupos_count}")
    
    cursor.execute("SELECT COUNT(*) FROM usuario")
    usuarios_count = cursor.fetchone()[0]
    print(f"  - Usuários: {usuarios_count}")
    
    if usuarios_count > 0:
        cursor.execute("SELECT nomeCompleto, cpf, adm FROM usuario")
        usuarios = cursor.fetchall()
        print("\n👥 Usuários cadastrados:")
        for usuario in usuarios:
            admin_status = "Admin" if usuario[2] else "Normal"
            print(f"  - {usuario[0]} (CPF: {usuario[1]}) - {admin_status}")
    
    cursor.close()
    connection.close()
    
    print("\n✅ Teste de conexão concluído com sucesso!")
    
except Exception as e:
    print(f"❌ Erro na conexão: {e}")
    print("\nVerifique se:")
    print("  1. O MySQL está rodando")
    print("  2. A senha está correta (579924)")
    print("  3. O banco 'pii' existe")
    print("  4. As tabelas foram criadas")
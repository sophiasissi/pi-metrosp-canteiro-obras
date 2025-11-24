# 🚇 Sistema de Gerenciamento de Obras - Metrô SP

Sistema móvel para acompanhamento e gestão de projetos de construção do Metrô de São Paulo, desenvolvido como Projeto Integrador no Instituto Mauá de Tecnologia.

## 🎯 Sobre o Projeto

Aplicação completa (mobile + backend) para gerenciar obras de construção com:
- **Monitoramento visual** de progresso através de fotografias
- **Gestão de usuários** e projetos  
- **Análise automatizada** com CNN para cálculo de progresso
- **Interface responsiva** e intuitiva

## 🛠️ Arquitetura do Sistema

### 📱 **Frontend (React Native + Expo)**
- **Framework**: React Native com Expo SDK 54
- **Linguagem**: TypeScript
- **Navegação**: Expo Router (file-based)
- **Estado**: Context API + useState

**Estrutura Principal:**
```
📁 app/
├── (auth)/        # Login, cadastro
├── (drawer)/      # Telas principais  
└── _layout.tsx    # Providers globais

📁 components/     # Componentes reutilizáveis
📁 contexts/       # Gerenciamento de estado
📁 services/       # Comunicação com API
```

### 🖥️ **Backend (Flask + Python)**
- **Framework**: Flask
- **Banco de dados**: MySQL
- **ORM**: SQLAlchemy  
- **Autenticação**: BCrypt
- **Upload**: Sistema local de arquivos
- **CORS**: Habilitado para mobile

**Estrutura do Backend:**
```
📁 backend/
├── app.py              # Servidor principal
├── models.py           # Modelos do banco
├── dbConnection.py     # Configuração MySQL
├── comparador_imagem.py # CNN para análise
└── routes/             # Endpoints da API
    ├── usuarios_routes.py
    ├── projetos_routes.py  
    └── imagensProgresso_routes.py
```

### 🗄️ **Banco de Dados (MySQL)**
**Tabelas principais:**
- `usuarios` - Dados de usuários e autenticação
- `grupos` - Grupos de trabalho
- `projetos` - Informações dos projetos
- `imagens_progresso` - Histórico de fotos e progresso

## 🚀 Instalação e Execução

### **Pré-requisitos**
- Node.js 18+
- Python 3.8+
- MySQL 8.0+
- Expo Go (mobile)

### **1. Frontend (React Native)**
```bash
# Clone o repositório
git clone https://github.com/sophiasissi/pi-metrosp-canteiro-obras.git
cd pi-metrosp-canteiro-obras

# Instale dependências
npm install

# Execute o aplicativo
npx expo start
```

### **2. Backend (Flask)**
```bash
# Entre na pasta backend
cd backend

# Instale dependências Python
pip install flask flask-sqlalchemy pymysql
pip install flask-cors flask-bcrypt
pip install boto3 python-dotenv cryptography
pip install numpy opencv-python

# Configure o banco MySQL (edite dbConnection.py)
# URI: mysql+pymysql://root:579924@127.0.0.1:3306/pii

# Execute o servidor
python app.py
```

### **3. Banco de Dados**
```sql
-- Crie o banco de dados
CREATE DATABASE pii;

-- Execute o app para criar as tabelas automaticamente
-- SQLAlchemy criará as tabelas baseadas nos models
```

## 📱 Funcionalidades

### 🏗️ **Gestão de Projetos**
- ✅ Cadastro com nome, local, período, grupo
- ✅ Validação de datas (não permite datas passadas)
- ✅ Upload de imagem inicial
- ✅ Visualização em cards responsivos

### 📸 **Acompanhamento de Progresso** 
- ✅ Adição de fotos via câmera/galeria
- ✅ Cálculo automático de percentual
- ✅ Histórico visual cronológico
- ✅ Sistema de cores por nível de progresso

### 👥 **Gestão de Usuários**
- ✅ Cadastro e autenticação
- ✅ Perfis de usuário e administrador
- ✅ Edição de dados pessoais
- ✅ Exclusão de usuários (admin)

### 🤖 **Análise CNN (Preparado)**
- ✅ Script de comparação de imagens
- ✅ Interface preparada para CNN
- ✅ Estrutura para análise automatizada

## 🎨 Recursos Técnicos

### **Principais Dependências Frontend**
```json
{
  "expo": "~54.0.13",
  "react-native": "0.81.4", 
  "expo-router": "~6.0.11",
  "expo-image-picker": "~17.0.8",
  "react-native-vector-icons": "^10.3.0",
  "axios": "^1.13.1"
}
```

### **Principais Dependências Backend**
```
Flask==2.3.3
Flask-SQLAlchemy==3.0.5  
Flask-CORS==4.0.0
Flask-Bcrypt==1.0.1
PyMySQL==1.1.0
OpenCV-Python==4.8.1
NumPy==1.24.3
```

## 🎨 Design System

**Cores do Metrô SP:**
- **Primária**: `#001489` (Azul Metrô)
- **Background**: `#F5F7FA` (Cinza claro)
- **Cards**: `#FFFFFF` (Branco)
- **Erro**: `#E74C3C` (Vermelho)

**Cores de Progresso:**
- ⚫ 0%: `#95A5A6` (Cinza - Não iniciado)
- 🔴 1-20%: `#E74C3C` (Vermelho - Muito baixo)
- 🟠 21-40%: `#FF6B35` (Laranja avermelhado - Baixo)
- 🟡 41-60%: `#F39C12` (Laranja - Médio baixo)
- 🟨 61-80%: `#F1C40F` (Amarelo - Médio alto)
- 🟢 81-99%: `#2ECC71` (Verde claro - Alto)
- ✅ 100%: `#27AE60` (Verde escuro - Completo)

## 🔗 API Endpoints

### **Usuários**
- `POST /api/user/register` - Cadastro
- `POST /api/user/login` - Autenticação  
- `PUT /api/user/settings/change-info` - Editar dados
- `DELETE /api/user/delete` - Excluir usuário

### **Projetos**  
- `POST /api/projects/create` - Criar projeto
- `GET /api/projects/list/{grupoID}` - Listar projetos
- `GET /api/projects/show/{projetoID}` - Detalhes do projeto

### **Progresso**
- `POST /api/progress/upload/{projetoID}` - Upload de foto
- `GET /api/progress/list/{projetoID}` - Histórico de progresso

## 👨‍💻 Equipe

**Instituto Mauá de Tecnologia - 2025.2**

| Desenvolvedor | GitHub | RA |
|---------------|--------|-----|
| Douglas Portatil Silva | [@Douglista](https://github.com/Douglista) | 23.01206-4 |
| Gustavo Coutinho Arruda | [@guctn](https://github.com/guctn) | 23.00938-0 |
| Sophia Sissi Curcio Guedes | [@sophiasissi](https://github.com/sophiasissi) | 23.01044-4 |
| Thiago Augusto da Costa Soto | [@ThiagoSoto](https://github.com/ThiagoSoto) | 23.01679-5 |
| Victor Pazo Molina da Silva | [@VictorPazo](https://github.com/VictorPazo) | 22.00429-7 |

## 📋 Estruturas de Dados

### **Usuário**
```typescript
interface User {
  usuarioID: number;
  nomeCompleto: string;
  cpf: string;
  grupoID: number;
  nomeGrupo: string;
  adm: boolean;
}
```

### **Projeto**
```typescript 
interface Project {
  projetoID: number;
  nomeProjeto: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  imagemInicial: string;
  grupoID: number;
}
```

### **Progresso**
```typescript
interface Progress {
  imagemID: number;
  projetoID: number;
  porcentagem: number;
  dataEnvio: string;
  caminhoImagem: string;
}
```

## 🔧 Configuração

### **Configurar Backend**
1. Edite `backend/dbConnection.py` com suas credenciais MySQL:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://user:password@host:port/database'
```

2. Execute `python app.py` para criar tabelas automaticamente

### **Configurar Frontend** 
1. Edite `services/apiService.ts` com IP do backend:
```typescript
const API_BASE_URL = 'http://SEU_IP:5000/api';
```

## 📄 Licença

Projeto acadêmico desenvolvido em parceria com o **Metrô de São Paulo**.

---

**📧 Contato**: Instituto Mauá de Tecnologia  
**🌐 GitHub**: [pi-metrosp-canteiro-obras](https://github.com/sophiasissi/pi-metrosp-canteiro-obras)

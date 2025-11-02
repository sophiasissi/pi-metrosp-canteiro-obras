# 🚇 PI Metrô SP - Canteiro de Obras

Sistema de gerenciamento e acompanhamento de progresso de projetos de construção para o Metrô de São Paulo. Desenvolvido como Projeto Integrador pelos alunos do Instituto Mauá de Tecnologia.

## 🎯 Sobre o Projeto

O **PI Metrô SP** é uma aplicação móvel multiplataforma desenvolvida em React Native/Expo para auxiliar no gerenciamento de projetos de construção do Metrô de São Paulo. O sistema permite o cadastro, monitoramento e acompanhamento visual do progresso de obras através de fotografias e métricas de progresso.

### 🏗️ Funcionalidades Principais

- **📋 Gerenciamento de Projetos**: Criação e edição de projetos com informações completas
- **📸 Acompanhamento Visual**: Sistema de fotos para monitorar o progresso das obras
- **📊 Métricas de Progresso**: Cálculo automático e visualização do percentual de conclusão
- **🎨 Sistema de Cores**: Indicadores visuais por nível de progresso (7 cores diferentes)
- **👥 Gestão de Usuários**: Sistema de cadastro e autenticação de usuários
- **🔍 Busca Inteligente**: Pesquisa de usuários e projetos
- **📱 Interface Responsiva**: Design adaptativo para diferentes tamanhos de tela

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React Native** com **Expo SDK 54**
- **TypeScript** para tipagem estática
- **Expo Router** para navegação file-based
- **Context API** para gerenciamento de estado global
- **React Navigation** (Drawer e Stack navigation)

### Recursos e Bibliotecas
- **Expo Image Picker** - Captura de fotos (câmera/galeria)
- **Expo Vector Icons** - Ícones do sistema
- **React Native Vector Icons** - Ícones FontAwesome
- **Async Storage** - Persistência local de dados

### Estrutura do Projeto
```
📁 app/
├── 📁 (auth)/          # Telas de autenticação
├── 📁 (drawer)/        # Telas principais (navegação drawer)
└── _layout.tsx         # Layout raiz com providers

📁 components/          # Componentes reutilizáveis
├── AddProgressModal.tsx
├── PhotoProgressList.tsx
└── themed-*.tsx

📁 contexts/           # Gerenciamento de estado
└── ProjectContext.tsx # Context de projetos

📁 constants/          # Constantes e configurações
└── theme.ts

📁 scripts/            # Scripts utilitários
└── comparador_imagens.py  # CNN para análise de progresso
```

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Expo Go** no dispositivo móvel:
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/sophiasissi/pi-metrosp-canteiro-obras.git
cd pi-metrosp-canteiro-obras
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npx expo start
```

4. **Execute no dispositivo**
- Escaneie o QR Code com o Expo Go
- Ou pressione `a` para Android / `i` para iOS (emulador)
- Ou pressione `w` para abrir no navegador web

### Scripts Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run android    # Executa no emulador Android
npm run ios        # Executa no simulador iOS  
npm run web        # Executa no navegador web
npm run lint       # Executa o linter
```

## 📱 Funcionalidades Detalhadas

### 🏗️ Gestão de Projetos

#### Cadastro de Projetos
- **Informações básicas**: Nome, localização, grupo
- **Período de execução**: Datas de início e fim com calendário customizado
- **Imagem inicial**: Foto de referência do projeto
- **Validação completa**: Campos obrigatórios e validação de datas

#### Visualização e Detalhes
- **Cards visuais**: Layout responsivo com fotos e informações
- **Barra de progresso**: Indicador visual colorido por nível
- **Informações completas**: Período, localização, grupo e progresso

### 📸 Sistema de Acompanhamento

#### Adição de Progresso
- **Modal intuitivo**: Interface simples para adicionar fotos
- **Múltiplas fontes**: Câmera ou galeria de fotos
- **Cálculo automático**: Progresso baseado no número de fotos
- **Nomenclatura automática**: "Imagem #1", "Imagem #2", etc.

#### Histórico Visual
- **Lista cronológica**: Todas as fotos com datas e progresso
- **Cores por progresso**:
  - 🟣 0-25%: Roxo (#8E44AD)
  - 🟠 26-50%: Laranja (#E67E22) 
  - 🔴 51-75%: Vermelho (#E74C3C)
  - 🟡 76-100%: Amarelo (#F39C12)

### 👥 Gestão de Usuários

#### Sistema de Cadastro
- **Informações pessoais**: Nome, email, grupo
- **Validação robusta**: Email único, senhas seguras
- **Tipos de usuário**: Usuário comum e Administrador

#### Configurações
- **Modo Administrador**: Gestão completa de usuários
- **Busca inteligente**: Pesquisa por nome ou email
- **Edição de perfil**: Alteração de dados pessoais

## 🔮 Preparação para CNN

O projeto está preparado para integração com **Redes Neurais Convolucionais (CNN)** para análise automatizada do progresso das obras:

### 🧠 Infraestrutura CNN
- **Script Python**: `comparador_imagens.py` para análise de imagens
- **Simulação de loading**: Modal com indicador de processamento CNN
- **Estrutura de dados**: Preparada para receber análises automatizadas

### 🎯 Funcionalidades Futuras
- **Análise automática**: Comparação entre foto inicial e progresso atual
- **Cálculo inteligente**: Progresso baseado em análise visual por CNN
- **Validação de qualidade**: Detecção de anomalias e problemas na obra

## 🎨 Design System

### 🎨 Paleta de Cores
- **Primary**: #001489 (Azul Metrô)
- **Background**: #F5F7FA (Cinza claro)
- **Cards**: #FFFFFF (Branco)
- **Text**: #333333 (Cinza escuro)
- **Error**: #E74C3C (Vermelho)

### 📐 Componentes
- **Cards responsivos**: Adaptáveis a diferentes tamanhos
- **Modals customizados**: Design consistente e acessível
- **Calendário nativo**: Interface intuitiva para seleção de datas
- **Formulários validados**: Feedback visual imediato

## 👨‍💻 Equipe de Desenvolvimento

**Instituto Mauá de Tecnologia - Projeto Integrador 2025.2**

Desenvolvido para o Metrô de São Paulo pelos estudantes:

| Desenvolvedor | GitHub | RA |
|---------------|--------|-----|
| **Douglas Portatil Silva** | [@Douglista](https://github.com/Douglista) | 23.01206-4 |
| **Gustavo Coutinho Arruda** | [@guctn](https://github.com/guctn) | 23.00938-0 |
| **Sophia Sissi Curcio Guedes** | [@sophiasissi](https://github.com/sophiasissi) | 23.01044-4 |
| **Thiago Augusto da Costa Soto** | [@ThiagoSoto](https://github.com/ThiagoSoto) | 23.01679-5 |
| **Victor Pazo Molina da Silva** | [@VictorPazo](https://github.com/VictorPazo) | 22.00429-7 |

## 📋 Estrutura de Dados

### Project Interface
```typescript
interface Project {
  id: string;
  name: string;
  location: string;
  period: string;
  group: string;
  createdAt: Date;
  image?: string;
  progress: number;
  progressHistory?: ProgressEntry[];
}
```

### ProgressEntry Interface
```typescript
interface ProgressEntry {
  id: string;
  projectId: string;
  progress: number;
  image?: string;
  observations?: string;
  createdAt: Date;
}
```

## 🔧 Configurações de Desenvolvimento

### ESLint + TypeScript
- Configuração completa para qualidade de código
- Regras específicas para React Native/Expo
- Integração com VS Code

### Permissões
- **Câmera**: Captura de fotos do progresso
- **Galeria**: Seleção de imagens existentes
- **Armazenamento**: Persistência local de dados

## 📄 Licença

Este projeto foi desenvolvido como Projeto Integrador para fins acadêmicos em parceria com o Metrô de São Paulo.

---

**📧 Contato**: [Instituto Mauá de Tecnologia](https://maua.br)  
**🌐 Repositório**: [GitHub - pi-metrosp-canteiro-obras](https://github.com/sophiasissi/pi-metrosp-canteiro-obras)

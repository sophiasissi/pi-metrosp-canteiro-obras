# 📱 Como Rodar o Projeto - PI Metrô SP

## ⚡ Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)
- **Git** - [Download aqui](https://git-scm.com/)
- **Expo Go** no seu celular:
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Passo a Passo

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/sophiasissi/pi-metrosp-canteiro-obras.git
cd pi-metrosp-canteiro-obras
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

### 3️⃣ Iniciar o Servidor
```bash
npx expo start
```

### 4️⃣ Abrir no Celular
- Abra o app **Expo Go** no seu celular
- Escaneie o QR Code que apareceu no terminal
- O app será carregado automaticamente

## 📋 Comandos Úteis

```bash
# Limpar cache e reinstalar dependências
npm install --force

# Iniciar com cache limpo
npx expo start --clear

# Ver logs detalhados
npx expo start --dev-client
```

## 🎯 Funcionalidades do App

- **Tela de Login** com validação de email e senha
- **Menu hambúrguer** nas telas internas
- **Navegação entre telas**: Home, Configurações, Adicionar Usuário
- **Interface responsiva** para diferentes tamanhos de tela

## ❗ Problemas Comuns

**QR Code não funciona?**
- Certifique-se que o celular e computador estão na mesma rede Wi-Fi
- Tente usar `npx expo start --tunnel`

**Erro de dependências?**
- Delete a pasta `node_modules` e rode `npm install` novamente

**App não carrega?**
- Feche o Expo Go completamente e abra novamente
- Tente `npx expo start --clear`

## 👥 Equipe

- **Branch atual**: `feature/telaLogin`
- **Repositório**: https://github.com/sophiasissi/pi-metrosp-canteiro-obras

---

✅ **Pronto!** Agora você pode rodar o projeto em qualquer máquina seguindo estes passos.

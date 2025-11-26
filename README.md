# 💸 Carteira Financeira — Next.js + TypeScript + SQLite

Aplicação completa de **carteira digital**, desenvolvida com **Next.js 14**, **TypeScript** e **SQLite**, permitindo:

- Cadastro e login com autenticação via JWT
- Depósitos
- Transferências entre contas
- Reversão de operações
- Histórico de transações
- Proteção de rotas
- Interface simples e funcional

Este projeto foi criado com foco em **boas práticas**, **arquitetura limpa**, **segurança**, e uso real do App Router do Next.js.

---

## 🚀 Tecnologias Utilizadas

- **Next.js 14 (App Router)**
- **TypeScript**
- **SQLite (better-sqlite3)**
- **JWT (jsonwebtoken)**
- **bcryptjs**
- **CSS puro**
- **Server Actions**
- **Rotas de API**

---

## 📦 Funcionalidades

### 🔑 Autenticação

- Cadastro de usuários
- Login com JWT
- Cookies HTTP-only
- Middleware de proteção

### 💰 Operações Financeiras

- Realizar depósitos
- Transferir para outra conta
- Reverter uma operação anterior
- Ver histórico completo

---

## 🛠️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/moura5412/carteira-financeira-project
cd carteira-financeira-project
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Gere o banco de dados

```bash
npm run migrate
```

### 4. Inicie o servidor

```bash
npm run dev
```

## Acesse o projeto em:

👉 http://localhost:3000

## 🔒 Segurança

Cookies HTTP-only
JWT com expiração
Transações atômicas com SQLite
Proteção de rotas no servidor
Validação robusta de dados

## Endpoints

### Autenticação

| Método | Rota               | Descrição |
| ------ | ------------------ | --------- |
| POST   | /api/auth/register | Cadastro  |
| POST   | /api/auth/login    | Login     |

### Conta

| Método | Rota                  | Descrição     |
| ------ | --------------------- | ------------- |
| POST   | /api/account/deposit  | Depósito      |
| POST   | /api/account/transfer | Transferência |
| POST   | /api/account/reverse  | Reversão      |
| GET    | /api/account/history  | Histórico     |

## 🧑‍💻 Autor

Gabriel de Moura Souza
GitHub: https://github.com/moura5412

# 🔐 Auth API - NestJS + Prisma + JWT

![NestJS](https://img.shields.io/badge/NestJS-v9-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Argon2](https://img.shields.io/badge/Argon2-Hashing-13B38C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTI1NiA0MDhjLTgzLjkgMC0xNTItNjguMS0xNTItMTUyczY4LjEtMTUyIDE1Mi0xNTIgMTUyIDY4LjEgMTUyIDE1Mi02OC4xIDE1Mi0xNTIgMTUyem0w-224Yy0zOS43IDAtNzIgMzIuMy03MiA3MnMzMi4zIDcyIDcyIDcyIDcyLTMyLjMgNzItNzItMzIuMy03Mi03Mi03MnoiLz48L3N2Zz4=)
API de autenticação segura com NestJS, Prisma e JWT, implementando refresh tokens e controle de acesso por roles.

## ✨ Funcionalidades

- **Autenticação JWT** com cookies HTTP-only
- **Refresh Tokens** seguros armazenados no banco
- **Controle de acesso** por roles (USER, ADMIN)
- **Validação de dados** com Zod
- **Hashing seguro** com Argon2
- **CRUD completo** de usuários
- **Prisma ORM** com PostgreSQL

## 🛠 Tecnologias

| Tecnologia       | Descrição                                  |
|------------------|-------------------------------------------|
| NestJS           | Framework para construção de APIs eficientes |
| Prisma           | ORM moderno para TypeScript/Node.js        |
| PostgreSQL       | Banco de dados relacional                 |
| Argon2           | Algoritmo de hashing para senhas          |
| Zod              | Validação de schemas TypeScript-first     |
| Passport.js      | Middleware de autenticação                |

## ⚙️ Configuração

1. Clone o repositório:
```bash
git clone https://github.com/piciliano/base-autentication.git
cd base-autentication
```
2. Instale as dependências:
```bash
npm install
```
3. Configure o ambiente:
```bash
cp .env.example .env
# Edite o .env com suas configurações
```
4. Execute as migrações do Prisma:
```bash
npx prisma migrate dev --name init
```
5. (Opcional) Popule o banco com dados iniciais:
```bash
npx prisma db seed
```
6. Execute em desenvolvimento:
```bash
npm run start:dev
```
### 1️⃣ Login Inicial (Geração dos Tokens)
```mermaid
sequenceDiagram
    participant Cliente
    participant Servidor
    Cliente->>Servidor: POST /auth/login (email, senha)
    Servidor->>Servidor: Valida credenciais (Argon2)
    Servidor->>Servidor: Gera JWT (1h) + Refresh Token (7d)
    Servidor->>Cliente: HTTP 200 + Cookies (JWT + Refresh)
```

### 2️⃣ Acesso com Token Válido
```mermaid
sequenceDiagram
    participant Cliente
    participant Servidor
    Cliente->>Servidor: GET /rota-protegida (Cookie JWT)
    Servidor->>Servidor: Verifica assinatura JWT
    Servidor->>Cliente: HTTP 200 + Dados protegidos
```

### 3️⃣ Renovação com Refresh Token
```mermaid
sequenceDiagram
    participant Cliente
    participant Servidor
    Cliente->>Servidor: GET /rota-protegida (JWT expirado)
    Servidor->>Cliente: HTTP 401 (Token expirado)
    Cliente->>Servidor: Envia Refresh Token (Cookie)
    Servidor->>Servidor: Verifica no banco de dados
    alt Token válido
        Servidor->>Cliente: Novos Cookies (JWT + Refresh)
    else Token inválido
        Servidor->>Cliente: HTTP 401 + Força novo login
    end
```
## 🔐 Detalhes da Implementação

### 🔑 Login
- Recebe email/senha
- Valida com Zod
- Verifica no banco (com Argon2)
- Gera:
  - JWT (1h de validade)
  - Refresh Token (7 dias)
- Armazena hash do refresh token no DB

### 🛡️ Acesso Protegido
- Middleware verifica cookie JWT
- Se expirado, usa refresh token para gerar novo JWT
- Atualiza cookies automaticamente

### 🚪 Logout
- Remove cookies
- (Opcional) Invalida refresh token no banco

## 🌐 Rotas da API

### 🔑 Autenticação (`/auth`)
| Método | Endpoint | Body (JSON)           | Descrição               |
|--------|----------|-----------------------|-------------------------|
| POST   | `/login` | `{email, password}`   | Autentica usuário       |
| GET    | `/me`    | -                     | Dados do usuário atual  |
| POST   | `/logout`| -                     | Encerra sessão          |

### 👥 Usuários (`/user`)
| Método | Endpoint | Body (JSON)           | Permissão | Descrição          |
|--------|----------|-----------------------|-----------|--------------------|
| POST   | `/`      | `{email, name, pw}`   | Pública   | Cria novo usuário  |
| GET    | `/`      | -                     | USER      | Lista usuários     |
| GET    | `/:id`   | -                     | Pública   | Busca por ID       |
| PATCH  | `/:id`   | `{email?, name?, pw?}`| Pública   | Atualiza usuário   |
| DELETE | `/:id`   | -                     | Pública   | Remove usuário     |

## 📚 Documentação Adicional

- [Prisma Documentation](https://www.prisma.io/docs) - Guia completo do ORM
- [NestJS Security](https://docs.nestjs.com/security) - Melhores práticas de segurança
- [JWT Best Practices](https://curity.io/resources/learn/jwt-best-practices) - Padrões para autenticação JWT
- [Argon2 Documentation](https://github.com/ranisalt/node-argon2) - Implementação do algoritmo de hashing

---

## 👨‍💻 Autor

<div align="center">
  <img src="https://github.com/piciliano.png" width="150" style="border-radius: 50%">
  
  **Neto Vasconcelos**  
  🌐 [Portfólio](https://www.netodeveloper.com)  
  🔗 [LinkedIn](https://linkedin.com/in/picilianovasconcelos)  
  💻 [GitHub](https://github.com/piciliano)
</div>

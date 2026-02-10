# A Beach Arena – MVP de Agendamento

MVP de app web para agendamento de quadras de areia da **A Beach Arena**, em monorepo com frontend React e backend Node/Express.

## Estrutura do projeto

- `apps/frontend`: app web React + Vite + TailwindCSS
- `apps/backend`: API Node.js + Express + Prisma + JWT
- `packages/shared`: schemas Zod compartilhados (auth, booking, court)

## Requisitos

- Node.js 18+ (`node -v`)
- npm 8+ (workspaces)
- Docker e Docker Compose (para subir MySQL e serviços)

## Variáveis de ambiente

### Backend (`apps/backend/.env`)

Copie de `.env.example`:

```env
DATABASE_URL="mysql://abeach:abeach@db:3306/abeacharena"
JWT_SECRET="sua_chave_jwt_segura_aqui"
PORT=4000

# Mercado Pago (obrigatório para pagamentos)
MP_ACCESS_TOKEN="seu_access_token_do_painel"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
```

Para desenvolvimento sem Docker, ajuste o host do MySQL (ex: `localhost`). O `MP_ACCESS_TOKEN` é obtido em https://www.mercadopago.com.br/developers/panel/app

### Frontend (`apps/frontend/.env`)

Copie de `.env.example`:

```env
VITE_API_URL="http://localhost:4000/api"
```

## Como rodar com Docker (recomendado)

Na raiz do projeto:

```bash
docker-compose up --build
```

Isso irá subir:

- MySQL em `localhost:3306`
- Backend em `http://localhost:4000`
- Frontend em `http://localhost:5173`

## Como rodar localmente (sem Docker)

1. **Subir MySQL localmente** (ou via Docker apenas para o banco).
2. Ajustar `DATABASE_URL` em `apps/backend/.env` para apontar para o seu MySQL.
3. Instalar dependências na raiz:

```bash
npm install
```

4. Rodar migrations + seed (no backend):

```bash
cd apps/backend
npx prisma migrate dev
npx prisma db seed
```

5. Iniciar backend:

```bash
npm run dev --workspace @abeach/backend
```

6. Iniciar frontend:

```bash
npm run dev --workspace @abeach/frontend
```

## Scripts principais

Na raiz:

- `npm run dev:backend` – sobe apenas o backend
- `npm run dev:frontend` – sobe apenas o frontend
- `npm run build` – build frontend e backend

## Funcionalidades

- Login e cadastro de usuário (roles: `ADMIN`, `USER`)
- Home com banner e cards de navegação
- Tela de agendamento com:
  - Calendário horizontal (14 dias)
  - Lista de quadras (Beach Tennis, Vôlei, Futvôlei)
  - Grade de horários (06h–23h)
  - Reserva com prevenção de conflito
- Tela "Meus Agendamentos" com cancelamento (usuário ou ADMIN)

Detalhes de implementação estão nos diretórios `apps/backend` e `apps/frontend`.


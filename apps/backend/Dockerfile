FROM node:20-alpine

WORKDIR /app

# Copia arquivos de configuração do monorepo
COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Instala dependências usando workspaces
RUN npm install --omit=dev

# Copia todo o código
COPY . .

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["npm", "start", "--workspace", "@abeach/backend"]


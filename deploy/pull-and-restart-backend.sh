#!/usr/bin/env bash
# Executar na VPS, a partir da raiz do projeto: ./deploy/pull-and-restart-backend.sh
# Ou: cd /var/www/abeach && ./deploy/pull-and-restart-backend.sh

set -e

echo "== Atualizando código (git pull) =="
git pull origin master

echo "== Sincronizando banco (Prisma) =="
cd apps/backend
npx prisma db push

echo "== Reiniciando backend (PM2) =="
pm2 restart abeach-backend

echo "== Backend atualizado =="

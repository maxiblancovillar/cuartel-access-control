#!/bin/sh
set -e

echo "🗄️  Aplicando migraciones de Prisma..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed (idempotente, usa upsert)..."
npx tsx prisma/seed.ts || echo "⚠️  Seed falló o ya estaba aplicado, continuando..."

echo "🚀 Iniciando backend..."
exec node dist/main.js

# ============================================
# Build stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Evitar la descarga de Chromium de Puppeteer durante el build
# (no se usa generación de PDF todavía; ver BACKEND_VULNERABILITIES.md)
ENV PUPPETEER_SKIP_DOWNLOAD=true

# OpenSSL requerido por el motor de Prisma en Alpine
RUN apk add --no-cache openssl

# Copiar package.json y package-lock.json
COPY package*.json ./
COPY prisma ./prisma

# Instalar TODAS las dependencias (necesarias para compilar)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client y compilar TypeScript
RUN npx prisma generate
RUN npm run build

# ============================================
# Runtime stage
# ============================================
FROM node:20-alpine

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true

# Instalar dumb-init (señales), curl (healthcheck) y openssl (requerido por Prisma engine)
RUN apk add --no-cache dumb-init curl openssl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar package.json e instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar build, prisma schema/migrations y Prisma Client generado
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Permisos: entrypoint ejecutable y ownership del usuario no-root
RUN chmod +x ./docker-entrypoint.sh && chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]

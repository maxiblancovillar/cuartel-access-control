# ============================================
# Build stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código
COPY . .

# Usar las variables de entorno de producción para el build de Vite
# (Vite embebe VITE_* en el bundle en tiempo de build, no en runtime)
COPY .env.docker .env

# Build
RUN npm run build

# ============================================
# Runtime stage
# ============================================
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check (127.0.0.1 explícito: "localhost" puede resolver a ::1 y fallar)
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Akaydın Tarım — Backend Dockerfile
# - Node 20 Alpine
# - Vite build (dist/)
# - Express API (server/index.js)
# - Vite SPA serve (production modda)
# ============================================

FROM node:20-alpine
RUN apk add --no-cache tini
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Dev deps kur (sadece build aşaması için)
RUN npm install --include=dev 2>/dev/null || true

# Frontend build
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html vite-env.d.ts ./
COPY index.tsx App.tsx constants.tsx types.ts ./
COPY components/ ./components/
COPY pages/ ./pages/
COPY hooks/ ./hooks/
COPY services/ ./services/
COPY public/ ./public/
COPY index.css ./
RUN npx vite build && npm prune --omit=dev

# Backend server
COPY server/ ./server/

# uploads + public
RUN mkdir -p uploads public && chown -R node:node /app
USER node

EXPOSE 3003
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/index.js"]

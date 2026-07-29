# ============================================
# Akaydın Tarım — Backend Dockerfile
# - Node 20 Alpine
# - Vite build (dist/)
# - Express API (server/index.js)
# - Vite SPA serve (production modda)
# ============================================

FROM node:20-alpine
# postgresql-client backend'in tablo oluşturması için gerekli
RUN apk add --no-cache tini postgresql16-client
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
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

# Backend server + init scripts
COPY server/ ./server/
COPY docker/init/ ./docker/init/
COPY docker/init-db.sh /usr/local/bin/init-db.sh
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/init-db.sh /usr/local/bin/startup.sh

RUN mkdir -p uploads public && chown -R node:node /app

EXPOSE 3003
ENTRYPOINT ["/sbin/tini", "--"]
# Root olarak başla, startup.sh izinleri düzeltsin, sonra node kullanıcısına geçsin
CMD ["/usr/local/bin/startup.sh"]

# ============================================
# Akaydın Tarım — Backend Dockerfile
# - Node 22 Alpine
# - Vite build (dist/)
# - Express API (server/index.js)
# - Vite SPA serve (production modda)
# ============================================

FROM node:22-alpine
# postgresql-client backend'in tablo oluşturması için gerekli
RUN apk add --no-cache tini postgresql-client
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install

# Frontend build
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html vite-env.d.ts ./
COPY index.tsx App.tsx constants.tsx types.ts ./
COPY components/ ./components/
COPY pages/ ./pages/
COPY hooks/ ./hooks/
COPY services/ ./services/
COPY public/ ./public/
COPY index.css ./
RUN pnpm build && pnpm prune --prod

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

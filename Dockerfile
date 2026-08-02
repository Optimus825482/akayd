# ============================================
# Akaydın Tarım — Backend Dockerfile
# - Node 22 Alpine
# - Express API (server/index.js)
# - SPA frontend ayrı container'da (Dockerfile.frontend → nginx)
# ============================================

FROM node:22-alpine
# postgresql-client backend'in tablo oluşturması için gerekli
RUN apk add --no-cache tini postgresql-client
WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts && npm rebuild esbuild

# Backend server + init scripts (P2-6: frontend build nginx container'ında — burada build yok)
COPY server/ ./server/
COPY public/ ./public/  # robots.txt + favicon seed (backend /robots.txt serve eder)
COPY docker/init/ ./docker/init/
COPY docker/init-db.sh /usr/local/bin/init-db.sh
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/init-db.sh /usr/local/bin/startup.sh

RUN mkdir -p uploads public && chown -R node:node /app

EXPOSE 3003
ENTRYPOINT ["/sbin/tini", "--"]
# Root olarak başla, startup.sh izinleri düzeltsin, sonra node kullanıcısına geçsin
CMD ["/usr/local/bin/startup.sh"]

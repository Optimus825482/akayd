FROM node:20-alpine

# ---- PostgreSQL kur ----
RUN apk add --no-cache postgresql16 postgresql16-client tini

# ---- Dizinler ----
RUN mkdir -p /run/postgresql && chown node:node /run/postgresql \
 && mkdir -p /app /app/data /app/uploads /app/public \
 && chown -R node:node /app /run/postgresql

WORKDIR /app

# ---- Node deps (sadece production runtime) ----
COPY package.json package-lock.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# ---- Vite build (devDeps ile, ayrı layer) ----
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html vite-env.d.ts ./
COPY index.tsx App.tsx constants.tsx types.ts ./
COPY components/ ./components/
COPY pages/ ./pages/
COPY hooks/ ./hooks/
COPY services/ ./services/
COPY public/ ./public/
COPY index.css ./
RUN npm install --include=dev 2>/dev/null && npx vite build && npm prune --omit=dev

# ---- Server + init SQL + startup ----
COPY server/ ./server/
COPY docker/init/ ./docker/init/
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3003
VOLUME ["/app/data", "/app/uploads", "/app/public"]
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/start.sh"]

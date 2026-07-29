# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev 2>/dev/null || npm install
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html vite-env.d.ts ./
COPY index.tsx App.tsx constants.tsx types.ts ./
COPY components/ ./components/
COPY pages/ ./pages/
COPY hooks/ ./hooks/
COPY services/ ./services/
COPY public/ ./public/
COPY index.css ./
RUN npx vite build

# ---- Stage 2: Production Runtime ----
FROM node:20-alpine
RUN apk add --no-cache tini
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./dist

# Create directories with correct permissions
RUN mkdir -p uploads public && \
    chown -R app:app /app

USER app

EXPOSE 3003
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/index.js"]

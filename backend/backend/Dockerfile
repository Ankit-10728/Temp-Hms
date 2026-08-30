# Debian-based (not alpine) because bcrypt compiles a native addon that
# doesn't ship prebuilt binaries for musl libc.
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --legacy-peer-deps: multer-storage-cloudinary@4.0.0 peer-depends on
# cloudinary@^1.21.0, but package.json pins cloudinary@^2.10.0. Until that's
# reconciled upstream, npm's strict peer resolution (npm 7+) rejects a plain
# install.
RUN npm ci --omit=dev --legacy-peer-deps

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN useradd --system --uid 1001 appuser \
    && mkdir -p /app/uploads \
    && chown -R appuser:appuser /app/uploads
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 5000) + '/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]

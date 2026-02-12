# Build Stage
FROM node:22-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

RUN npm i -g corepack

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc* ./

# Copy source code
COPY packages ./packages
COPY apps ./apps
COPY internal ./internal
COPY scripts ./scripts

# Install dependencies with cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build:antd

RUN echo "Builder Success 🎉"

# Serve Stage
FROM nginx:stable-alpine AS production

# Configure nginx for mjs files
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf \
    && rm -rf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web-antd/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

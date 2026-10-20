# Single container: builds the client, then serves it and the websocket from one
# Node process on one port. Node 22.18+ is required because the server runs
# TypeScript directly via native type stripping (no tsc/tsx build step).
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=8787
EXPOSE 8787
CMD ["node", "backend/start-server.ts"]

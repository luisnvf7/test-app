FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# BUILD_ID can be set at build time: docker build --build-arg BUILD_ID=abc123 .
ARG BUILD_ID
ENV BUILD_ID=${BUILD_ID}

CMD ["node", "server.js"]

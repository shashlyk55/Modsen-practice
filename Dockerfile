FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

RUN npm install -g pm2

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["pm2-runtime", "dist/main.js"]

FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./

RUN npm install

COPY backend/ ./

RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/index.js"]

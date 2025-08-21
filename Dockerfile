
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --production=false || true
COPY . .
RUN npm run build || true
EXPOSE 3000
CMD ["npm", "start"]

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN adduser -D appuser && chown -R appuser /app
USER appuser
EXPOSE 8001
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

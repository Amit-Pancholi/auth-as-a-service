FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN adduser -D appuser && chown -R appuser /app
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O - http://localhost:8003/api/AaaS/rbac/v1/health || exit 1
EXPOSE 8003
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN adduser -D appuser && chown -R appuser /app
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O - http://localhost:8001/api/AaaS/user/v1?action=health || exit 1
EXPOSE 8001
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

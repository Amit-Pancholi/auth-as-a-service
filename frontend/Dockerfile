FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN adduser -D appuser && chown -R appuser /app
USER appuser
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npm start"]
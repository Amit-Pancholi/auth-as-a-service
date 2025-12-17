const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // same URL as Prisma
  max: 20, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;

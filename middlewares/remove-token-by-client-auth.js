const jwt = require('jsonwebtoken')
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const Response = require("../utils/response-handler");
const pool = require("../utils/db-connection");
const { findInTableById } = require("../utils/db-query");
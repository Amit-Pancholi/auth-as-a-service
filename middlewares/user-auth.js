const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const Response = require("../utils/response-handler");
const { findInTableById } = require("../utils/db-query");
const pool = require("../utils/db-connection");

/**
 * @description
 * we will provide access token in delete and refresh token in update
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(400)
        .json(new Response(400, null, "Bad request,Invalid token"));

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(400).json(new Response(400, null, "broken request"));

    const tokenExist = await prisma.token.findFirst({
      where: {
        access_token: token,
      },
    });
    if (!tokenExist)
      return res.status(400).json(new Response(400, null, "Invalid token"));

    const query = `SELECT * FROM user_schema.user_blacklist ub
    WHERE ub.user_id=$1`;

    const blacklist = await pool.query(query, [tokenExist.user_id]);

    if (blacklist.rows.length > 0)
      return res
        .status(403)
        .json(new Response(403, null, "User temprary blacklist"));

    const result = await findInTableById(
      "App",
      "client_schema",
      tokenExist.app_id
    );

    if (!result)
      return res.status(204).json(new Response(204, null, "Invalid token"));

    let decode;
    try {
      decode = jwt.verify(token, result.secret);
    } catch (err) {
      return res
        .status(401)
        .json(new Response(401, null, "Token expired or invalid"));
    }

    // update it leater
    if (!decode || !decode.client_id) {
      return res
        .status(401)
        .json(new Response(401, null, "Invalid token payload"));
    }
    req.head = decode;
    next();
  } catch (err) {
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};

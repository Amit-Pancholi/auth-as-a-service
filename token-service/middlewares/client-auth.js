const jwt = require("jsonwebtoken");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(401)
        .json(new Response(401, null, "Bad request,Invalid token"));

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json(new Response(401, null, "broken request"));

    const tokenExist = await prisma.client_token.findFirst({
      where: {
        access_token: token,
      },
    });
    if (!tokenExist)
      return res.status(401).json(new Response(401, null, "Invalid token"));

    let decode;
    try {
      decode = jwt.verify(token, JWT_CLIENT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json(new Response(401, null, "Token expired or invalid"));
    }

    if (!decode || !decode.email || !decode.client_id) {
      return res
        .status(401)
        .json(new Response(401, null, "Invalid token payload"));
    }
    console.log(decode)
    req.head = decode;
    next();
  } catch (err) {
    return res
      .status(500)
      .json(
        new Response(500, null, "Internal server error " + err)
      );
  }
};

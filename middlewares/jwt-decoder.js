const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
const Response = require('../utils/response-handler')
/**
 * @description
 * it will a middleware that will validate token 
 * it will also check if token is blacklist or not
 * @pass
 * it will add decoder to request and pass to next 
 */
module.exports = async (req, res, next) => {
  try {
    //check for header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(400)
        .json(new Response(400, null, "Bad request,Invalid token"));
    // check token
    const token = authHeader.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Unauthorized, token missing"));
    // console.log("action");

    //   token is blacklist or not
    // const blacklistToken = await prisma.Logout_Token.findFirst({
    //   where: { token: token },
    // });
    // if (blacklistToken)
    //   return res.status(403).json({
    //     status: "failure",
    //     Message: "Expired token,access denied",
    //   });
    //   decode token
    const decode = jwt.verify(token, JWT_CLIENT_SECRET);
    if (!decode || !decode.email || !decode.client_id) {
      return res
        .status(401)
        .json(new Response(401, null, "Invalid token"));
    }

    // attach decoder to reqest
    // console.log(decode)
    req.head = decode;
    next();
  } catch (error) {
        return res.status(500).json(new Response(500,null,"Internal server error " + error));
  }
};

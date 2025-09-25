const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
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
      return res.status(400).json({
        status: "failure",
        Message: "Bad request,Invalid token",
      });
    // check token
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({
        status: "failure",
        Message: "Unauthorized, token missing",
      });
    //   token is blacklist or not
    const blacklistToken = await prisma.Token.findFirst({
      where: { token: token },
    });
    if (blacklistToken)
      return res.status(403).json({
        status: "failure",
        Message: "Expired token,access denied",
      });
    //   decode token
    const decode = jwt.verify(token, JWT_CLIENT_SECRET);
    if (!decode || !decode.email) {
      return res.status(401).json({ Message: "Invalid token payload" });
    }

    // attach decoder to reqest
    req.user = decode;
    next();
  } catch (error) {
        return res.status(500).json({
          status: "failure",
          Message: "Error validate token",
          error: error.message,
        });
  }
};

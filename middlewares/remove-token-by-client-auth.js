const jwt = require("jsonwebtoken");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
const Response = require("../utils/response-handler");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(400)
        .json(new Response(400, null, "Bad request,Invalid token"));

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(400).json(new Response(400, null, "broken request"));

    const decode = jwt.verify(token, JWT_CLIENT_SECRET);
    if (!decode || !decode.email) {
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

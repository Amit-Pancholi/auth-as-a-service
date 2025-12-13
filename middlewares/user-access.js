require("dotenv").config();
const jwt = require("jsonwebtoken");
const { JWT_URL_SECRET } = process.env;
const Response = require("../utils/response-handler");
const pool = require("../utils/db-connection");

/** 
@brief verify request using two different tokens url and bearer
@param req it will for accept request
@param res it will for send response
@param next for call next variable
@returns {json} fail response
*/

module.exports = async (req, res, next) => {
  try {
    const urlToken = req.params.token;

    // 1. URL Token Verification
    if (!urlToken) {
      return res
        .status(401)
        .json(new Response(401, null, "URL token is missing."));
    }

    const urlPayload = jwt.verify(urlToken, JWT_URL_SECRET);
    if (!urlPayload || !urlPayload.app_id || !urlPayload.client_id) {
      return res.status(401).json(new Response(401, null, "Invalid Token"));
    }
    const query = `SELECT * FROM client_schema."App" a WHERE a.id=$1 AND a.active=true;`;
    const app = await pool.query(query, [urlPayload.app_id]);
    if (app.rows[0].client_id != urlPayload.client_id)
      return res.status(403).json(new Response(403, null, "invalid token"));

    req.head = urlPayload;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res
      .status(500)
      .json(new Response(500, null, "Token verification failed"));
  }
};

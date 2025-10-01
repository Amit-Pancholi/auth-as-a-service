const express = require("express");
const manager = require("../controllers/manage-controller");
const verifiyClient = require("../middlewares/remove-token-by-client-auth");
const verifyUser = require("../middlewares/user-auth");
const tokenRout = express.Router();

tokenRout.post("/token/generate", manager.postGenerateToken);
// whis routes only access by me
tokenRout.get("/token", manager.getToken);

tokenRout.get("/token/client/:id", manager.getTokenByClient);
tokenRout.get("/token/app/:id", manager.getTokenByapp);
// provide refresh token
tokenRout.put("/token", verifyUser, manager.putUpdateToken);
// provide access token
tokenRout.delete(
  "/token/client/:token",
  verifiyClient,
  manager.deleteTokenByClient
);
tokenRout.delete("/token/user", verifyUser, manager.deleteTokenByUser);
module.exports = tokenRout;

const express = require("express");
const tokenController = require("../controllers/manage-controller");
const verifiyClient = require("../middlewares/client-auth");
const verifiyUser = require("../middlewares/user-auth");
const tokenRout = express.Router();

// =============== CREATE TOKEN ===============
// User signup/login: no middleware (they don’t have token yet)
tokenRout.post("/user", tokenController.postGenerateTokenForUser);

// Client signup/login: optional middleware (or API key check)
tokenRout.post("/client", tokenController.postGenerateTokenForClient);

// =============== GET TOKEN(S) ===============
// Require client auth
tokenRout.get("/client/:clientId", verifiyClient, tokenController.getTokenForClient);
tokenRout.get("/user", verifiyClient, tokenController.getAllUserToken);
tokenRout.get("/app/:appId", verifiyClient, tokenController.getTokenByapp);

// =============== UPDATE TOKEN ===============
// Require auth
tokenRout.put("/user", verifiyUser, tokenController.putUpdateTokenForUser);
tokenRout.put("/client", verifiyClient, tokenController.putUpdateTokenForClient);

// =============== DELETE TOKEN ===============
// User deleting their own token
tokenRout.delete("/by-user", verifiyUser, tokenController.deleteTokenByUser);

// Client/admin deleting token
tokenRout.delete("/by-client/:tokenId", verifiyClient, tokenController.deleteTokenByClient);
tokenRout.delete("/client", verifiyClient, tokenController.deleteTokenForClient);


module.exports = tokenRout;

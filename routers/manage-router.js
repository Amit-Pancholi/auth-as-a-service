const express = require("express");
const tokenController = require("../controllers/manage-controller");
const verifiyClient = require("../middlewares/remove-token-by-client-auth");
const verifyUser = require("../middlewares/user-auth");
const tokenRout = express.Router();

// =============== CREATE TOKEN ===============
tokenRout.post("/user", tokenController.postGenerateTokenForUser);
tokenRout.post("/client", tokenController.postGenerateTokenForClient);

// =============== GET TOKEN(S) ===============
// Get single token for a specific client
tokenRout.get("/client/:clientId", tokenController.getTokenForClient);

// Get all user tokens (client_id must come from req.head or middleware)
tokenRout.get("/user", tokenController.getAllUserToken);

// Get tokens filtered by app id (client_id in req.head)
tokenRout.get("/app/:appId", tokenController.getTokenByapp);

// =============== UPDATE TOKEN ===============
tokenRout.put("/user", tokenController.putUpdateTokenForUser);
tokenRout.put("/client", tokenController.putUpdateTokenForClient);

// =============== DELETE TOKEN ===============
// Delete by access token (used by admin or service)
tokenRout.delete("/by-client", tokenController.deleteTokenByClient);

// Delete token by user (using req.head.user_id and Authorization header)
tokenRout.delete("/by-user", tokenController.deleteTokenByUser);

// Delete client token using Authorization header
tokenRout.delete("/client", tokenController.deleteTokenForClient);

module.exports = tokenRout;

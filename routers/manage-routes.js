// NOTE: No changes required in this router to fix frontend build errors (fixes applied to frontend/pages/_app.js and frontend/postcss.config.js)

const express = require("express");
const router = express.Router();
const controller = require("../controllers/manage-controller"); // adjust path if needed
const auth = require("../middlewares/jwt-decoder");

// ====================== USER SERVICE ======================

// 🔹 Generate URL and JWT token for communication with other microservices
// Method: POST
// Headers: client_id (inside req.head)
// Body: { app_id }
// Response: { url, token }
router.post("/getUrlAndToken", auth, controller.getUrlAndToken);

// 🔹 Get all users
// Method: GET
// Headers: { Authorization: token }
router.get("/user/all", auth, controller.getAllUser);

// 🔹 Ban a user
// Method: POST
// Headers: { Authorization: token }
//    const {user_id,app_id} = req.body
router.post("/user/ban", auth, controller.banUser);

// 🔹 Unban a user
// Method: POST
// Headers: { Authorization: token }
//    const {user_id,app_id} = req.body
router.post("/user/unban", auth, controller.unbanUser);

// 🔹 Get all banned users
// Method: GET
// Headers: { Authorization: token }
router.get("/user/banned", auth, controller.getBannedUser);

// 🔹 Get all active users
// Method: GET
// Headers: { Authorization: token }
router.get("/user/active", auth, controller.getActiveUser);

// 🔹 Get all inactive users
// Method: GET
// Headers: { Authorization: token }
router.get("/user/inactive", auth, controller.getInactiveUser);

// ====================== APP SECRET MANAGEMENT ======================

// 🔹 Add or update secret for app
// Method: POST
// head : client_id
// Body: {  app_id, secret }
// No token required
router.post("/app/secret", auth, controller.postAddAndUpdateSecret);

// we will not use this in current version


// 🔹 Get secret for app
// Method: POST
// head: {client_id}
// Body: { app_id }
// No token required
router.post("/app/get-secret", auth, controller.getSecret);

// ====================== ROLE MANAGEMENT ======================

// 🔹 Create a new role
// Method: POST
// Headers: { Authorization: token }
// head : {client_id}
// Body: {  app_id, name, description }
router.post("/role/create", auth, controller.postCreateRole);

// 🔹 Update existing role
// Method: PUT
// Headers: { Authorization: token }
// Body: { role_id, name, description }
router.put("/role/update", auth, controller.putUpdateRole);

// 🔹 Delete role
// Method: DELETE
// Headers: { Authorization: token }
// Body: { role_id }
router.delete("/role/delete", auth, controller.deleteRole);

// 🔹 Get all roles
// Method: GET
// Headers: { Authorization: token }
router.get("/role/all", auth, controller.getRoles);


router.post("/role/app", auth, controller.getRolesByAppId);

// ====================== USER-ROLE ASSIGNMENT ======================

// 🔹 Assign a role to a user
// Method: POST
// Headers: { Authorization: token }
// Body: { role_id, user_id, app_id }
router.post("/role/assign", auth, controller.postAssinRole);

// 🔹 Update assigned role for a user
// Method: PUT
// Headers: { Authorization: token }
// Body: { role_id, ur_id }
router.put("/role/assign/update", auth, controller.putUpdateAssinRole);

// 🔹 Remove assigned role
// Method: DELETE
// Headers: { Authorization: token }
// Body: { ur_id }
router.post("/role/assign/delete", auth, controller.deleteAssinRole);

// 🔹 Get all users with assigned roles
// Method: GET
// Headers: { Authorization: token }
router.get("/role/assign/all", auth, controller.getAlluserWithAssinRole);

// 🔹 Get all users with assigned roles by app_id
// Method: POST
// Headers: { Authorization: token }
// Body: { app_id }
router.post(
  "/role/assign/app",
  auth,
  controller.getAlluserWithAssinRoleByAppId
);

// ====================== TOKEN SERVICE ======================

// 🔹 Get users with token details
// Method: GET
// Headers: { Authorization: token }
router.get("/token/user", auth, controller.getUserWithToken);

// 🔹 Get tokens by app_id
// Method: POST
// Headers: { Authorization: token }
// Body: { app_id }
router.post("/token/app", auth, controller.getUserWithTokenByApp);

router.post("/token/user/remove", auth, controller.postRemoveUserToken);

// 📘 Add new app
// body: {app_name,description,secret}
// header: token
router.post("/add", auth, controller.postAddApps);

// 📘 Update existing app
// body: {app_name,description,secret}
// header: token
router.put("/update/:appId", auth, controller.putUpdateApps);

// 📘 Get all apps
// header: token
router.get("/all", auth, controller.getApp);

// 📘 Get app by ID
// header :token
router.get("/:appId", auth, controller.getAppById);

// 📘 Delete app
// header : token
router.delete("/:appId", auth, controller.deleteApp);

module.exports = router;

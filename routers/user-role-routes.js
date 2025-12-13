const express = require("express");
const router = express.Router();
const userRoleController = require("../controllers/user-role-controller");
const verifyClient = require("../middlewares/client-auth");
// ===== Role management routes =====

// Add role to user
router.post("/add/:roleId", verifyClient, userRoleController.postAddRoleToUser);

// Update user role
router.put("/update/:roleId", verifyClient, userRoleController.postUpdateRole);

// Remove user role
router.delete(
  "/remove/:URId",
  verifyClient,
  userRoleController.deleteRoleFromUser
);

// Get all users with roles (by client)
router.get("/all", verifyClient, userRoleController.getAllRoledUser);

// Get all users with roles (by app)
router.get(
  "/app/:appId",
  verifyClient,
  userRoleController.getAllRoledUsersByApp
);

// ======================
// Get single user's role
// only call by internal service
// ======================
router.get("/role/:userId", userRoleController.getSingleUserRole);

module.exports = router;

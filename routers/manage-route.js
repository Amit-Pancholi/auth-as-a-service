const express = require("express");
const router = express.Router();
const userController = require("../controllers/manage-controller");

// ================= CRUD operations =================

// 🟠 Update user details (no email or mobile updates)
router.post("/update", userController.postUpdateUser);

// 🔴 Soft delete user (set active=false)
router.post("/delete", userController.postDeleteUser);

// ================= Blacklist operations =================

// 🚫 Add user to blacklist
router.post("/ban", userController.postBanUser);

// ✅ Remove user from blacklist
router.post("/unban", userController.removeUserFromBlacklist);

// ================= Fetching users =================

// 📋 Get all users
router.get("/all", userController.getAllUser);

// 🟢 Get all active users
router.get("/active", userController.getActiveUser);

// 🔴 Get all inactive users
router.get("/inactive", userController.getInactiveUser);

// 🚷 Get all banned users
router.get("/banned", userController.getBanUser);

module.exports = manageUserRouter;

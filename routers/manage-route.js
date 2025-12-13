const express = require("express");
const router = express.Router();
const userController = require("../controllers/manage-controller");
const userUpdate = require("../middlewares/user-update");
const auth = require('../middlewares/jwt-decoder')

// ================= CRUD operations =================

// 🟠 Update user details (no email or mobile updates)
router.post("/update/:token",userUpdate, userController.postUpdateUser);

// 🔴 Soft delete user (set active=false)
router.post("/delete/:token",userUpdate, userController.postDeleteUser);

// ================= Blacklist operations =================

// 🚫 Add user to blacklist
router.post("/ban",auth, userController.postBanUser);

// ✅ Remove user from blacklist
router.post("/unban",auth, userController.removeUserFromBlacklist);

// ================= Fetching users =================

// 📋 Get all users
router.get("/all",auth, userController.getAllUser);

// 🟢 Get all active users
router.get("/active",auth, userController.getActiveUser);

// 🔴 Get all inactive users
router.get("/inactive",auth, userController.getInactiveUser);

// 🚷 Get all banned users
router.get("/banned",auth, userController.getBanUser);

module.exports = router
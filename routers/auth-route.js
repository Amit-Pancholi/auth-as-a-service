const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const userAccess = require('../middlewares/user-access')
const userUpdate = require('../middlewares/user-update')
// =======================
// Authentication Routes
// =======================

// ✅ User Signup
// Header: { app_id, client_id}
router.post("/signup/:token",userAccess, authController.postSignUp);

// ✅ User Login
// Header: { app_id,client_id}
router.post("/login/:token",userAccess, authController.postLogin);

// ✅ User Logout
// Header: { Authorization: "Bearer <token>" }
router.post("/logout",userUpdate, authController.postLogOut);

module.exports = router;

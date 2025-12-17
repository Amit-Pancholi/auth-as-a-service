const express = require("express");
const authcontroller = require("../controllers/auth-controller");

const router = express.Router();

router.get("/login", authcontroller.getLogin);
router.get("/signup", authcontroller.getSignup);
router.post("/login", authcontroller.postLogin);
router.post("/signup", authcontroller.postSignup);
router.get("/logout", authcontroller.getLogout);

module.exports = router;
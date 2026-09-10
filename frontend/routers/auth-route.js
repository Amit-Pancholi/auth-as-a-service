const express = require("express");
const authcontroller = require("../controllers/auth-controller");

const router = express.Router();

router.get("/health", (req, res) => {
  try {
    return res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error");
  }
});
router.get("/login", authcontroller.getLogin);
router.get("/signup", authcontroller.getSignup);
router.post("/login", authcontroller.postLogin);
router.post("/signup", authcontroller.postSignup);
router.get("/logout", authcontroller.getLogout);

module.exports = router;
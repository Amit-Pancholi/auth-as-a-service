const express = require('express')
const controller = require('../controllers/client-controller')
const auth = require("../middlewares/jwt-decoder")
const authRoute = express.Router()

authRoute.post('/signUp',controller.postSignUp)
authRoute.post('/login',controller.postLogin)
authRoute.get('/myself',auth,controller.getMyself)
authRoute.post("/update/myself", auth, controller.postUpdateMyself);
authRoute.post('/logOut',auth,controller.postLogOut)

module.exports = authRoute



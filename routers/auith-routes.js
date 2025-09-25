const express = require('express')
const controller = require('../controllers/auth-controller')
const auth = require("../middlewares/jwt-decoder")
const authRoute = express.Router()

authRoute.post('/signUp',controller.postSignUp)
authRoute.post('/login',controller.postLogin)
authRoute.post('/logOut',auth,controller.postLogOut)

module.exports = authRoute



const express = require('express')
const controller = require('../controllers/auth-controller')

const authRoute = express.Router()

authRoute.post('/signUp',controller.postSignUp)
authRoute.post('/login',controller.postLogin)
authRoute.post('/logOut',controller.postLogOut)

module.exports = authRoute



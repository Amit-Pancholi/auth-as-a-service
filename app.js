const express = require('express')
const manageRouter = require('./routers/manage-route.js')
const authRouter = require('./routers/auth-route.js')
const error404 = require('./errors/error404.js')
const app = express()


app.use(express.json())

app.use('/api/AaaS/v1',authRouter)
app.use('/api/AaaS/v1',manageRouter)
app.use(error404)

module.exports = app
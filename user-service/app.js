const express = require('express')
const action = require('./middlewares/action-manage.js')
const error404 = require('./errors/error404.js')
const app = express()


app.use(express.json())

app.use('/api/AaaS/user/v1',action)
app.use(error404)

module.exports = app
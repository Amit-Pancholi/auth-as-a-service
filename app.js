const express = require('express')
const error404 = require('./errors/error404.js')
const app = express()


app.use(express.json())

// app.use('/api/AaaS/v1',authRoute)

app.use(error404)

module.exports = app
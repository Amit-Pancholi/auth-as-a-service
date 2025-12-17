const express = require("express");
const error404 = require('./errors/error404')
const manageRoute = require('./routers/manage-router')
const app = express();

app.use(express.json());
app.use('/api/AaaS/token/v1',manageRoute)

app.use(error404)
module.exports = app;

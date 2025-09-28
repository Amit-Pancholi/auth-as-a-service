const express = require("express");
const error404 = require('./errors/error404')
const app = express();

app.use(express.json());


app.use(error404)
module.exports = app;

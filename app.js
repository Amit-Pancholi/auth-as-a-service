const express = require("express");
const error404 = require("./errors/error404.js");
const app = express();
const manageRoutes = require("./routers/manage-routes.js");
const authRoute = require("./routers/auith-routes.js");

app.use(express.json());

app.use("/api/AaaS/v1", authRoute);
app.use("/api/AaaS/v1", manageRoutes);

app.use(error404);

module.exports = app;

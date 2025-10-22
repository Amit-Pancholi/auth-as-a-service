const express = require("express");
const error404 = require('./errors/error404')
const roleManageRoute = require('./routers/role-manage-routes')
const userRoleRoute = require('./routers/user-role-routes')
const app = express();

app.use(express.json());
app.use('/api/AaaS/rbac/v1',roleManageRoute)
app.use("/api/AaaS/rbac/user/v1",userRoleRoute);

app.use(error404)
module.exports = app;

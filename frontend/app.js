const express = require('express');
const path = require('path');
const session = require("express-session");

const authRoutes = require("./routers/auth-route");
const dashboardRoutes = require("./routers/dashboard-route");
const userRoleRoutes = require("./routers/user-role-route");
const rootDir = require('./utils/path');


const app = express()

app.use(express.static(path.join(rootDir, "public")));
app.use(express.urlencoded());
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(
  session({
    secret: "system32",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);
app.get('/',(req,res)=>{
    res.render('index',{title:"Home",
        isLoggedIn:req.session?.isLoggedIn,
        message:{},
        errors:[]
    })
})

app.use("/", authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use("/dashboard", userRoleRoutes);
// 404 ERROR HANDLER

app.use('/',(req,res)=>{
    res.status(404).render('error/error404',{title:"404 - Page Not Found"})
})
module.exports = app;
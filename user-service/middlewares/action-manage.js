const manageRouter = require("../routers/manage-route.js");
const authRouter = require("../routers/auth-route.js");
const Response = require("../utils/response-handler.js");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    const { action } = req.query;

    switch (action) {
      case "login":
      case "signup":
        req.url = `/${action}/${token}`;
        return authRouter.handle(req, res, next);
      case "logout":
        req.url = `/${action}`;
        return authRouter.handle(req, res, next);
      case "update":
      case "delete":
        req.url = `/${action}/${token}`;
        return manageRouter.handle(req, res, next);

      default:
        req.url = `/${action}`;
        // console.log(req)
        return manageRouter.handle(req, res, next);
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error user service not work"));
  }
};

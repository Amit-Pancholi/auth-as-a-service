const { check, validationResult } = require("express-validator");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");
const { findInTableById } = require("../utils/db-query");
// all token data come in req head
exports.postDeleteUser = async (req, res, next) => {
  try {
    const { user_id, client_id, app_id } = req.head;
    const clientExist = await findInTableById(
      "Client",
      "client_schema",
      client_id
    );
    if (!clientExist || clientExist.active == false)
      return res
        .status(404)
        .json(new Response(404, null, "Client not found or removed"));

    const appExist = await findInTableById("App", "client_schema", app_id);
    if (!appExist || appExist.active == false)
      return res
        .status(404)
        .json(new Response(404, null, "App not found or removed"));

    const userExist = await findInTableById("user", "user_schema", user_id);
    if (!userExist || userExist.active == false)
      return res
        .status(404)
        .json(new Response(404, null, "User not found or removed"));

    await prisma.user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        active: false,
      },
    });

    return res
      .status(200)
      .json(new Response(200, null, "User removed successfully"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error loginning user",
      error: err.message,
    });
  }
};

// get userId and app_id,iclient_id inside req head
// don't update email and mobile number in anycase
exports.postUpdateUser = [
  check("first_name")
    .trim()
    .notEmpty()
    .withMessage("Please enter first name")
    .isLength({
      min: 5,
    })
    .withMessage("First name must be at least 5 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  check("last_name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),
  check("password").trim(),
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        status: "failure",
        Message: "Error occure in sending data",
        error: error.array().map((err) => err.msg),
      });
    } else {
      next();
    }
  },
  async (req, res, next) => {
    try {
      const { user_id, client_id, app_id } = req.head;
      const clientExist = await findInTableById(
        "Client",
        "client_schema",
        client_id
      );
      if (!clientExist || clientExist.active == false)
        return res
          .status(404)
          .json(new Response(404, null, "Client not found or removed"));

      const appExist = await findInTableById("App", "client_schema", app_id);
      if (!appExist || appExist.active == false)
        return res
          .status(404)
          .json(new Response(404, null, "App not found or removed"));

      const userExist = await findInTableById("user", "user_schema", user_id);
      if (!userExist || userExist.active == false)
        return res
          .status(404)
          .json(new Response(404, null, "User not found or removed"));

      const { first_name, last_namee, password } = req.body;
      let user;
      if (password) {
        let encryptPassword = await bcrypt.hash(password, 12);
        user = await prisma.user.update({
          where: { id: Number(user_id) },
          data: {
            first_name: first_name,
            last_name: last_namee,
            password: encryptPassword,
            app_id: app_id,
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: Number(user_id) },
          data: {
            first_name: first_name,
            last_name: last_namee,
            app_id: app_id,
          },
        });
      }
      return res.status(200).json(new Response(200,null,"user update successfully"))
    } catch (err) {
      return res.status(500).json({
        status: "failure",
        Message: "Error updating user",
        error: err.message,
      });
    }
  },
];

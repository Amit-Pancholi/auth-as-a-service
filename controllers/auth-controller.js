const { check, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Response = require("../utils/response-handler");
// const user_url = process.env.USER_SERVICE_URL;
const token_url = process.env.TOKEN_SERVICE_URL;
// const rbac_url = process.env.RBAC_SERVICE_URL;

// pass app_id through token in head and we will pass client jwt secret in head also
// ========== SIGNUP ==========
exports.postSignUp = [
  check("first_name")
    .trim()
    .notEmpty()
    .withMessage("Please enter first name")
    .isLength({
      min: 1,
    })
    .withMessage("First name must be at least 5 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  check("last_name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),
  check("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  check("mobile_no")
    .trim()
    .notEmpty()
    .withMessage("Please enter a mobile number")
    .isLength({
      min: 10,
      max: 10,
    })
    .withMessage("Please enter a valid mobile number")
    .matches(/^[0-9]+$/)
    .withMessage("Please enter a valid mobile number"),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Please enter a password")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  check("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please enter a confirm password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  (req, res, next) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res
          .status(400)
          .json(
            new Response(
              400,
              null,
              "Error sending data " + error.array().map((err) => err.msg)
            )
          );
      } else {
        next();
      }
    } catch (err) {
      return res
        .status(500)
        .json(new Response(500, null, "Serverside error " + err));
    }
  },
  async (req, res, next) => {
    try {
      const { first_name, last_name, email, mobile_no, password } = req.body;
      const { client_id, app_id } = req.head;
      // let app_id = 1;
      // let client_id = 1;
      if (!first_name || !email || !mobile_no || !app_id || !password)
        return res
          .status(400)
          .json(new Response(400, null, "All fields are required"));

      const existUser = await prisma.user.findFirst({
        where: { email: email, app_id: app_id, active: true },
      });
      if (existUser)
        return res
          .status(409)
          .json(new Response(409, null, "user already exist"));

      const encryptPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          first_name: first_name,
          last_name: last_name,
          email: email,
          mobile_no: mobile_no,
          password: encryptPassword,
          app_id: app_id,
        },
      });

      // call token service to genrate token
      // const token = jwt.sign(
      //   {
      //     first_name: first_name,
      //     last_name: last_name,
      //     email: email,
      //     app_id: app_id,
      //   },
      //   req.head.secret,
      //   { expiresIn: "1d" }
      // );
      let token;
      try {
        token = await fetch(`${token_url}/api/AaaS/token/v1/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: client_id,
            user_id: user.id,
            app_id,
          }),
        });
        // console.log(token)
        if (!token.ok) {
          let error = await token.json()
          await prisma.user.delete({
            where: {
              id: user.id,
            },
          });
          return res
            .status(error.statusCode)
            .json(new Response(error.statusCode, null, "Error token service "+ error.message));
        }
      } catch (err) {
        await prisma.user.delete({
          where: {
            id: user.id,
          },
        });
      return res
        .status(500)
        .json(new Response(500, null, "Internal server error " + err));
      }
      // console.log("hello");

      const userToken = await token.json();
      if (!userToken) {
        await prisma.user.delete({
          where: {
            id: user.id,
          },
        });
        return res
          .status(503)
          .json(new Response(503, null, "token service not work"));
      }

      const accessTokens = userToken?.data;

      if (!accessTokens) {
        await prisma.user.delete({
          where: {
            id: user.id,
          },
        });
        return res
          .status(501)
          .json(new Response(501, null, "token not genrated"));
      }

      // we need to develope the MFA for verifiy email and number(may be)
      return res.status(201).json(
        new Response(
          201,
          {
            token: accessTokens,
            user: {
              name: first_name + " " + last_name,
              email: email,
              mobile_no: mobile_no,
            },
          },
          "user created"
        )
      );
    } catch (error) {
      // console.log(error);
      return res
        .status(500)
        .json(new Response(500, null, "Error creating user " + error));
    }
  },
];
// secret and app_id in head
// =============Login==============
exports.postLogin = [
  check("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  check("password").trim().notEmpty().withMessage("Please enter a password"),

  (req, res, next) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res
          .status(400)
          .json(
            new Response(
              400,
              null,
              "Error sending data " + error.array().map((err) => err.msg)
            )
          );
      } else {
        next();
      }
    } catch (err) {
      return res
        .status(500)
        .json(new Response(500, null, "Serverside error " + err));
    }
  },
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { client_id, app_id } = req.head;
      // let app_id = 1
      // let client_id = 1

      // console.log("hello");

      if (!email || !password)
        return res
          .status(400)
          .json(new Response(400, null, "all field requried"));

      const user = await prisma.user.findFirst({
        where: { email: email, app_id: app_id, active: true },
      });
      if (!user)
        return res.status(404).json(new Response(404, null, "User not found"));

      const blacklistUser = await prisma.user_blacklist;
      findFirst({
        where: { user_id: user.id, app_id: app_id },
      });
      if (blacklistUser)
        return res
          .status(403)
          .json(new Response(403, null, "user is banned,contact admin"));

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword)
        return res
          .status(400)
          .json(new Response(400, null, "user or password is wrong"));
      // call token service
      // const token = jwt.sign(
      //   {
      //     firstName: user.first_name,
      //     lastName: user.last_name,
      //     email: user.email,
      //     app_id: app_id,
      //   },
      //   secret,
      //   { expiresIn: "1d" }
      // );

      let token;
      try {
        token = await fetch(`${token_url}/api/AaaS/token/v1/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: client_id,
            user_id: user.id,
            app_id,
            app_id,
          }),
        });

        if (!token.ok) {
          let error = await token.json()
          return res
            .status(error.statusCode)
            .json(new Response(error.statusCode, null, "Error token service "+error.message));
        }
      } catch (err) {
        return res
          .status(500)
          .json(new Response(500, null, "Internal server error " + err));
      }

      const userToken = await token.json();
      if (!userToken) {
        return res
          .status(503)
          .json(new Response(503, null, "token service not work"));
      }

      const accessTokens = userToken?.data;

      if (!accessTokens) {
        return res
          .status(501)
          .json(new Response(501, null, "token not genrated"));
      }

      return res.status(200).json(
        new Response(
          200,
          {
            token: accessTokens,
            user: {
              name: user.first_name + " " + user.last_name,
              email: user.email,
              app: user?.app,
            },
          },
          "user successfully login"
        )
      );
    } catch (error) {
      // console.log(error.message);
      return res.status(500).json(new Response(500, null, "Error login user " + error));
    }
  },
];
// improve it later
// we will remove token from token service database or set that token into blacklist
exports.postLogOut = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(400).json({
        status: "failure",
        Message: "Bad request,Invalid token",
      });
    const token = authHeader.split(" ")[1];

    await prisma.Logout_Token.create({
      data: { token: token },
    });

    return res.status(201).json({
      status: "success",
      Message: "logout successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json(new Response(500, null, "Error in user logout "+error));
  }
};

const { check, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Response = require('../utils/response-handler')

// pass app_id through token in head and we will pass client jwt secret in head also
// ========== SIGNUP ==========
exports.postSignUp = [
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
      const { first_name, last_namee, email, mobile_no, password } = req.body;
      const { app_id } = req.head;

      if (!first_name || !email || !mobile_no || !app_id || !password)
        return res
          .status(400)
          .json(new Response(400, null, "All fields are required"));

      const existUser = await prisma.user.findMany({
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
          last_name: last_namee,
          email: email,
          mobile_no: mobile_no,
          password: encryptPassword,
          app_id:app_id
        },
      });
      const token = jwt.sign(
        {
          first_name: first_name,
          last_namee: last_namee,
          email: email,
          app_id: app_id,
        },
        req.head.secret,
        { expiresIn: "1d" }
      );

      // we need to develope the MFA for verifiy email and number(may be)
      return res.status(201).json(
        new Response(201, {
          token: token,
          client: {
            name: first_name + " " + last_namee,
            email: email,
            mobile_No: mobile_no,
          }
        },"user created")
      );
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        Message: "Error creating user",
        error: error.message,
      });
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
        return res.status(400).json({
          stauts: "failure",
          Message: "Validation failed",
          error: error.array().map((err) => err.msg),
        });
      } else {
        next();
      }
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        Message: "bad request",
        error: error.message,
      });
    }
  },
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const {app_id,secret} = req.head

      if (!email || !password)
        return res
          .status(400)
          .json(new Response(400, null, "all field requried"));

      const user = await prisma.user.findFirst({
        where: { email: email,app_id:app_id,active:true },
      });
      if (!user)
        return res.status(404).json(new Response(404, null, "User not found"));

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword)
        return res
          .status(400)
          .json(new Response(400, null, "user or password is wrong"));
      const token = jwt.sign(
        {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          app_id:app_id
        },
        secret,
        { expiresIn: "1d" }
      );

      return res.status(200).json(
        new Response(200, {
          token: token,
          client: {
            name: user.first_name + " " + user.last_name,
            email: user.email,
            app: user.app,
          },
        },"user successfully login")
      );
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        Message: "Error login user",
        error: error.message,
      });
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
    return res.status(500).json({
      status: "failure",
      Message: "Error in user logout",
      error: error.message,
    });
  }
};


const { check, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user-model");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;

// ========== SIGNUP ==========
exports.postSignUp = (req, res, next) => [
  check("firstName")
    .trim()
    .notEmpty()
    .withMessage("Please enter first name")
    .isLength({
      min: 5,
    })
    .withMessage("First name must be at least 5 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  check("lastName")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  check("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  check("mobileNumber")
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
  check("app").trim().notEmpty().withMessage("Please enter app/website name"),
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
        stauts: "failure",
        Message: "Error occure in sending data",
        error: error.array().map((err) => err.msg),
      });
    } else {
      next();
    }
  },
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, mobileNumber, app, password } =
        req.body;

      if (!firstName || !email || !mobileNumber || !app || !password)
        return res
          .status(400)
          .json({ status: "failure", Message: "All fields are required" });
      // continue this after postgras setup

      const existUser = await prisma.Client.findUnique({
        where: { email: email },
      });
      if (existUser)
        return res
          .status(409)
          .json({ status: "failure", Message: "user already exist" });

      const encryptPassword = await bcrypt.hash(password, 12);

      const user = await prisma.Client.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          mobile_No: mobileNumber,
          password: encryptPassword,
        },
      });
      const token = jwt.sign({name:firstName+" "+lastName,email:email}, JWT_CLIENT_SECRET);

      return res.status(201).json({
        status: "success",
        Message:"user created",
        token: token,
        client: {
          name:firstName+' '+lastName,
          email:email,
          mobile_No:mobileNumber
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        Message: "Error creating user",
        error: error.message,
      });
    }
  },
];

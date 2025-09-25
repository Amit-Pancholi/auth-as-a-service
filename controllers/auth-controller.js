const { check, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;

/*
=============DATABASE===========
==========client================
id           Int
first_name   String
last_name    String
email        String
mobile_No    String
app          String
password     String

=======Token blacklist=========
id           Int
token        String
*/

// ========== SIGNUP ==========
exports.postSignUp = [
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
          app: app,
        },
      });
      const token = jwt.sign(
        { firstName: firstName, lastName: lastName, email: email, app: app },
        JWT_CLIENT_SECRET,
        { expiresIn: "1d" }
      );

      // we need to develope the MFA for verifiy email and number(may be)
      return res.status(201).json({
        status: "success",
        Message: "user created",
        token: token,
        client: {
          name: firstName + " " + lastName,
          email: email,
          mobile_No: mobileNumber,
          app: app,
        },
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

      if (!email || !password)
        return res.status(400).json({
          status: "failure",
          Message: "all field requried",
        });

      const user = await prisma.Client.findUnique({
        where: { email: email },
      });
      if (!user)
        return res.status(404).json({
          status: "failure",
          Message: "User not found",
        });

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword)
        return res.status(400).json({
          status: "failure",
          Message: "user or password is wrong",
        });
      const token = jwt.sign(
        {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          app: user.app,
        },
        JWT_CLIENT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        status: "success",
        Message: "Client login successfully",
        token: token,
        client: {
          name: user.first_name + " " + user.last_name,
          email: user.email,
          app: user.app,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        Message: "Error loginning user",
        error: error.message,
      });
    }
  },
];

// ===============Logout================
exports.postLogOut = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(400).json({
      status:"failure",
      Message:"Bad request,Invalid token"
    })
    const token = authHeader.split(" ")[1]

    await prisma.Token.create({
      data:{token:token}
    })

    return res.status(201).json({
      status:"success",
      Message:"logout successfully"
    })

  } catch (error) {
    return res.status(500).json({
      status: "failure",
      Message: "Error in user logout",
      error: error.message,
    });
  }
};

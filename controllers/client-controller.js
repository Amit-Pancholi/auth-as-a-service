const { check, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Response = require("../utils/response-handler");
const { checkClient } = require("../utils/check-exist");
// const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
// const user_url = process.env.USER_SERVICE_URL;
const token_url = process.env.TOKEN_SERVICE_URL;
// const rbac_url = process.env.RBAC_SERVICE_URL;

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
      min: 1,
    })
    .withMessage("First name must be at least 5 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  check("lastName")
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
  check("description")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("description can only contain letters and spaces"),
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
   } catch (error) {
      return res
        .status(500)
        .json(
          new Response(500, null, "Error creating client: " + error.message)
        );
   }
  },
  async (req, res, next) => {
    // console.log("Signup Request Body:", req.body);
    try {
      const {
        firstName,
        lastName,
        email,
        mobileNumber,
        app,
        password,
        description,
      } = req.body;

      if (!firstName || !email || !mobileNumber || !app || !password)
        return res
          .status(400)
          .json(new Response(400, null, "All fields are required"));

      const existUser = await prisma.Client.findUnique({
        where: { email: email },
      });
      if (existUser)
        return res
          .status(409)
          .json(new Response(409, null, "User already exist"));

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
      const client = await prisma.Client.findUnique({
        where: { email: email },
      });
      const app_obj = await prisma.App.create({
        data: {
          app_name: app,
          client_id: client.id,
          description: description,
        },
      });
      let token;
      try {
        token = await fetch(`${token_url}/api/AaaS/token/v1/client`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: client.id,
          }),
        });

        if (!token.ok) {
          await prisma.Client.delete({
            where: {
              id: client.id,
            },
          });
          let error = await token.json();
          return res
            .status(error.statusCode)
            .json(new Response(error.statusCode, null, "token service not work " + error.message));
        }
      } catch (err) {
        await prisma.Client.delete({
          where: {
            id: client.id,
          },
        });
        return res
          .status(500)
          .json(
            new Response(500, null, "Error genrating token from token service " + err)
          );
      }

      const userToken = await token.json();
      if (!userToken) {
        await prisma.Client.delete({
          where: {
            id: client.id,
          },
        });
        return res
          .status(503)
          .json(new Response(503, null, "token service not work"));
      }

      const accessTokens = userToken?.data;

      if (!accessTokens) {
        await prisma.Client.delete({
          where: {
            id: client.id,
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
            client: {
              name: client.first_name + " " + client.last_name,
              email: client.email,
              app: app_obj.app_name,
            },
          },
          "Client created successfully"
        )
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          new Response(500, null, "Error creating client: " + error.message)
        );
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
    } catch (error) {
        return res
          .status(500)
          .json(
            new Response(500, null, "Error creating client: " + error.message)
          );
    }
  },
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res
          .status(400)
          .json(new Response(400, null, "All fields are required"));

      const user = await prisma.Client.findUnique({
        where: { email: email },
      });
      if (!user)
        return res.status(404).json(new Response(404, null, "User not found"));

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword)
        return res
          .status(400)
          .json(new Response(400, null, "User or password is wrong"));
      // const token = jwt.sign(
      //   {
      //     firstName: user.first_name,
      //     lastName: user.last_name,
      //     email: user.email,
      //     app: user.app,
      //   },
      //   JWT_CLIENT_SECRET,
      //   { expiresIn: "1d" }
      // );

      let token;
      try {
        token = await fetch(`${token_url}/api/AaaS/token/v1/client`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: user.id,
          }),
        });

        if (!token.ok) {
          let error = await token.json()
          return res
            .status(error.statusCode)
            .json(new Response(error.statusCode, null, error.message));
        }
      } catch (err) {
        return res
          .status(500)
          .json(
            new Response(500, null, "Error genrating token from token service")
          );
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
          .status(503)
          .json(new Response(503, null, "token service not work"));
      }
      return res.status(200).json(
        new Response(
          200,
          {
            token: accessTokens,
            client: {
              name: user.first_name + " " + user.last_name,
              email: user.email,
            },
          },
          "Login successful"
        )
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          new Response(500, null, "Error logging in user: " + error.message)
        );
    }
  },
];
exports.getMyself = async (req, res) => {
  try {
    const { client_id } = req.head;

    const client = await prisma.Client.findUnique({
      where: {
        id: Number(client_id),
      },
    });
    if (!client)
      return res.status(404).json(new Response(404, null, "Invalid user"));
    return res.status(200).json(
      new Response(
        200,
        {
          user: {
            first_name: client.first_name,
            last_name: client.last_name,
            email: client.email,
            mobile_no: client.mobile_No,
          },
        },
        "user fetch successfully"
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new Response(500, null, "Error in user logout: " + error.message));
  }
};
exports.postUpdateMyself = [
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
    } catch (error) {
      return res
        .status(500)
        .json(
          new Response(500, null, "Error creating client: " + error.message)
        );
    }
  },
  async (req, res) => {
    try {
      const { client_id } = req.head;
      const clientExist = await checkClient(client_id, res);
      if (!clientExist) return;

      const { first_name, last_name, mobile_no } = req.body;

      const clientUpdate = await prisma.Client.update({
        where: {
          id: clientExist.id,
        },
        data: {
          first_name,
          last_name,
          mobile_No: mobile_no,
        },
      });
      return res.status(200).json(
        new Response(
          200,
          {
            user: {
              first_name,
              last_name,
              mobile_no,
            },
          },
          "user updated successfully"
        )
      );
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json(
          new Response(500, null, "Error in user updating: " + error.message)
        );
    }
  },
];
// ===============Logout================
exports.postLogOut = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(400)
        .json(new Response(400, null, "Authorization header missing"));
    const token = authHeader.split(" ")[1];

    await prisma.Logout_Token.create({
      data: { token: token },
    });

    return res.status(201).json(new Response(201, null, "Logout successful"));
  } catch (error) {
    return res
      .status(500)
      .json(new Response(500, null, "Error in user logout: " + error.message));
  }
};

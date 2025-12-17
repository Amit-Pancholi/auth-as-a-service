const cookie = require("cookie");
const session = require("express-session");
const { check, validationResult } = require("express-validator");
const backend_url = process.env.BACKEND_URL || "http://localhost:8000";

exports.getSignup = (req, res) => {
  res.render("signup", {
    title: "Signup",
    isLoggedIn: req.session?.isLoggedIn,
    postData: {},
    message: {},
    errors: [],
  });
};
exports.postSignup = [
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
        // console.log(error.array().map((err) => err.msg));
        return res.render("signup", {
          title: "Signup",
          postData: req.body,
          isLoggedIn: req.session?.isLoggedIn,
          message: {},
          errors: error.array().map((err) => err.msg),
        });
      } else {
        next();
      }
    } catch (error) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: error.message,
      });
    }
  },
  async (req, res) => {
    try {
      console.log(req.body);
      const {
        firstName,
        lastName,
        email,
        mobileNumber,
        app,
        password,
        description,
        confirmPassword,
      } = req.body;

      const response = await fetch(`${backend_url}/api/AaaS/v1/signUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobileNumber,
          app,
          password,
          description,
          confirmPassword,
        }),
      });
      if (!response.ok) {
        console.log(response);
        return res.status(response.status).render("signup", {
          title: "Signup",
          postData: req.body,
          isLoggedIn: req.session?.isLoggedIn,
          message: {},
          errors: ["Invalid data provided"],
        });
      }
      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });

      // On successful login, redirect to home or dashboard
      const tokens = data?.data;
      // console.log(tokens);
      const { access_token, refresh_token } = tokens.token;

      // set cookies
      res.setHeader("Set-Cookie", [
        cookie.serialize("access_token", access_token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        }),
        cookie.serialize("refresh_token", refresh_token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        }),
      ]);
      req.session.isLoggedIn = true;
      req.session.user = data?.data?.client?.name;
      await req.session.save();
      return res.redirect("/Dashboard");
    } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      });
    }
  },
];
exports.getLogin = (req, res) => {
  res.render("login", {
    title: "Login",
    isLoggedIn: req.session?.isLoggedIn,
    postData: {},
    message: {},
    errors: [],
  });
};
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
        // console.log(error.array().map((err) => err.msg));
        return res.render("login", {
          title: "Login",
          postData: req.body,
          isLoggedIn: req.session?.isLoggedIn,
          message: {},
          errors: error.array().map((err) => err.msg),
        });
      } else {
        next();
      }
    } catch (error) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: error.message,
      });
    }
  },
  async (req, res) => {
    try {
      console.log(req.body);
      const { email, password } = req.body;

      const response = await fetch(`${backend_url}/api/AaaS/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        console.log(response);
        return res.status(response.status).render("login", {
          title: "Login",
          postData: req.body,
          isLoggedIn: req.session?.isLoggedIn,
          message: {},
          errors: ["Invalid email or password"],
        });
      }
      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });

      // On successful login, redirect to home or dashboard
      const tokens = data?.data;
      console.log(tokens);
      const { access_token, refresh_token } = tokens.token;

      // set cookies
      res.setHeader("Set-Cookie", [
        cookie.serialize("access_token", access_token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        }),
        cookie.serialize("refresh_token", refresh_token, {
          httpOnly: true,
          secure: false,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        }),
      ]);
      req.session.isLoggedIn = true;
      req.session.user = data?.data?.client?.name;
      await req.session.save();
      return res.redirect("/Dashboard");
    } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      });
    }
  },
];

exports.getLogout = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.redirect("/");
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};

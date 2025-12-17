const backend_url = process.env.BACKEND_URL || "http://localhost:8000";
const cookie = require("cookie");
const session = require("express-session");
const { check, validationResult } = require("express-validator");
exports.getDashboard = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/v1/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
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
    const apps = data?.data;
    res.render("dashboard/dashboard", {
      activeTop: "dashboard",
      activeSide: "overview",
      totalUsers: 0,
      totalApps: apps.length,
      totalRoles: 0,
      totalBanned: 0,
      logs: [],
      isLoggedIn: req.session?.isLoggedIn,
      message: {},
      errors: [],
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.getApps = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/v1/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
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
    const apps = data?.data;
    // console.log(tokens);
    res.render("dashboard/apps", {
      activeTop: "apps",
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      apps,
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.getUrlToken = async (req, res) => {
  try {
    const { app_id } = req.body;
    const cookies = cookie.parse(req.headers.cookie || "");
    // console.log(app_id);
    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/v1/getUrlAndToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ app_id }),
    });
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });
    // console.log(data);
    return res
      .status(data.statusCode)
      .json({ url: data.data.url, token: data.data.token });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.getCreateApp = (req, res) => {
  try {
    res.render("dashboard/createApp", {
      activeSide: "apps",
      activeTop: "Create App",
      postData: {},
      isLoggedIn: req.session?.isLoggedIn,
      errors: [],
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};

exports.postAddApp = [
  check("appName")
    .trim()
    .notEmpty()
    .withMessage("Please enter app/website name"),
  check("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long")
    .matches(/^[a-zA-Z0-9\s.,!()-]+$/)
    .withMessage(
      "Description can only contain letters, numbers, and basic punctuation"
    ),
  check("secret").trim().notEmpty().withMessage("Please enter a secret"),
  (req, res, next) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        // console.log(error.array().map((err) => err.msg));
        return res.render("dashboard/createApp", {
          activeSide: "apps",
          activeTop: "Create App",
          postData: req.body,
          isLoggedIn: req.session?.isLoggedIn,
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
      const { appName, description, secret } = req.body;
      const cookies = cookie.parse(req.headers.cookie || "");
      // console.log(app_id);
      const accessToken = cookies.access_token;
      // console.log("Access Token:", accessToken);

      const response = await fetch(`${backend_url}/api/AaaS/v1/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ app_name: appName, description, secret }),
      });
      if (!response.ok) {
        console.log(response);
        return res.status(response.status).render("error/server-error", {
          errorCode: response.status,
          type: "error",
          message: err.message,
        });
      }

      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });
      // console.log(data);
      return res.redirect("/dashboard/apps");
    } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      });
    }
  },
];
exports.postUpdateApp = (req, res) => {
  try {
    const { app_id, appName, description, secret } = req.body;
    const app = {
      app_id,
      app_name: appName,
      description,
      secret,
    };
    res.render("dashboard/updateApp", {
      activeSide: "apps",
      activeTop: "Update App",
      app,
      isLoggedIn: req.session?.isLoggedIn,
      errors: [],
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};
exports.putUpdateApp = [
  check("app_name")
    .trim()
    .notEmpty()
    .withMessage("Please enter app/website name"),
  check("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long")
    .matches(/^[a-zA-Z0-9\s.,!()-]+$/)
    .withMessage(
      "Description can only contain letters, numbers, and basic punctuation"
    ),
  check("secret").trim().notEmpty().withMessage("Please enter a secret"),
  (req, res, next) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        // console.log(error.array().map((err) => err.msg));
        return res.render("dashboard/updateApp", {
          activeSide: "apps",
          activeTop: "Update App",
          app: req.body,
          isLoggedIn: req.session?.isLoggedIn,
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
  async (req, res, next) => {
    try {
      const { appId } = req.params;
      const { app_name, description } = req.body;
      const cookies = cookie.parse(req.headers.cookie || "");
      // console.log(app_id);
      const accessToken = cookies.access_token;
      // console.log("Access Token:", accessToken);

      const response = await fetch(
        `${backend_url}/api/AaaS/v1/update/${appId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ app_name, description }),
        }
      );
      if (!response.ok) {
        console.log(response);
        return res.status(response.status).render("error/server-error", {
          errorCode: response.status,
          type: "error",
          message: err.message,
        });
      }

      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });
      // console.log(data);
      next();
    } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      });
    }
  },
  async (req, res, next) => {
    try {
      const { appId } = req.params;
      const { secret } = req.body;
      const cookies = cookie.parse(req.headers.cookie || "");
      // console.log(app_id);
      const accessToken = cookies.access_token;
      // console.log("Access Token:", accessToken);

      const response = await fetch(`${backend_url}/api/AaaS/v1/app/secret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ app_id: appId, secret }),
      });
      if (!response.ok) {
        console.log(response);
        return res.status(response.status).render("error/server-error", {
          errorCode: response.status,
          type: "error",
          message: err.message,
        });
      }

      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });
      // console.log(data);
      return res.redirect("/dashboard/apps");
    } catch (err) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: err.message,
      });
    }
  },
];

exports.postDeleteApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const cookies = cookie.parse(req.headers.cookie || "");
    // console.log(app_id);
    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/v1/${appId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    // console.log(data);
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });
    // console.log(data);
    return res.redirect("/dashboard/apps");
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};

exports.getTokens = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/v1/token/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
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
    const userToken = data?.data;
    // console.log(apps);
    // console.log(userToken);
    res.render("dashboard/token", {
      activeTop: "tokens",
      activeSide: "overview",
      tokens: userToken,
      isLoggedIn: req.session?.isLoggedIn,
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};

exports.postForceLogout = async (req, res) => {
  try {
    const { token_id } = req.body;
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(
      `${backend_url}/api/AaaS/v1/token/user/remove`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token_id }),
      }
    );
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });
    return res.redirect("/Dashboard/Tokens");
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");

    const accessToken = cookies.access_token;
    // console.log("Access Token:", accessToken);

    const response = await fetch(`${backend_url}/api/AaaS/v1/myself`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.log(response);
      return res.status(response.status).render("error/server-error", {
        errorCode: response.status,
        type: "error",
        message: err.message,
      });
    }

    const data = await response.json();
    if (!data)
      return res.status(503).render("error/server-error", {
        errorCode: 503,
        type: "error",
        message: "Service Unavailable. Please try again later.",
      });
    console.log(data);
    res.render("dashboard/settings", {
      activeTop: "settings",
      activeSide: "overview",
      isLoggedIn: req.session?.isLoggedIn,
      user: data.data.user,
      errors: [],
    });
  } catch (err) {
    return res.status(500).render("error/server-error", {
      errorCode: 500,
      type: "error",
      message: err.message,
    });
  }
};

exports.postUpdateSetting = [
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
        // console.log(error.array().map((err) => err.msg));
        return res.render("dashboard/settings", {
          title: "Settings",
          user: req.body,
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
      const { first_name, last_name, mobile_no,email } = req.body;
      const cookies = cookie.parse(req.headers.cookie || "");

      const accessToken = cookies.access_token;
      // console.log("Access Token:", accessToken);

      const response = await fetch(`${backend_url}/api/AaaS/v1/update/myself`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ first_name, last_name, mobile_no,email }),
      });
      if (!response.ok) {
        console.log(response);
        const data = await response.json();
        console.log(data)
        return res.status(response.status).render("error/server-error", {
          errorCode: response.status,
          type: "error",
          message: err.message,
        });
      }

      const data = await response.json();
      if (!data)
        return res.status(503).render("error/server-error", {
          errorCode: 503,
          type: "error",
          message: "Service Unavailable. Please try again later.",
        });
      return res.redirect("/dashboard/settings");
    } catch (error) {
      return res.status(500).render("error/server-error", {
        errorCode: 500,
        type: "error",
        message: error.message,
      });
    }
  },
];

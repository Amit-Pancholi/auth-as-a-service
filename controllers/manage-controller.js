const { check, validationResult } = require("express-validator");
const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");
const { findInTableById } = require("../utils/db-query");
// all token data come in req head
exports.postDeleteUser = async (req, res, next) => {
  try {
    const { user_id, client_id, app_id } = req.head;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);
    if (!clientExist || !appExist || !userExist) return;

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

      const clientExist = await checkClient(client_id, res);
      const appExist = await checkApp(app_id, res);
      const userExist = await checkUser(user_id, res);
      if (!clientExist || !appExist || !userExist) return;

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
      return res
        .status(200)
        .json(new Response(200, null, "user update successfully"));
    } catch (err) {
      return res.status(500).json({
        status: "failure",
        Message: "Error updating user",
        error: err.message,
      });
    }
  },
];

// adding and removing user from blacklist by client
// user id and client id will send through res head and also check user is block or not through middlewar
exports.postBanUser = async (req, res, next) => {
  try {
    const { user_id, client_id, app_id } = req.head;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);
    if (!clientExist || !appExist || !userExist) return;

    const userBan = await prisma.user_blacklist.findFirst({
      where: {
        user_id: Number(user_id),
        app_id: Number(app_id),
      },
    });
    if (userBan)
      return res
        .status(400)
        .json(new Response(400, null, "user already in blacklist"));

    await prisma.user_blacklist.create({
      data: {
        user_id: Number(user_id),
        app_id: Number(app_id),
      },
    });

    return res
      .status(201)
      .json(new Response(201, null, "user add to blacklist"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error processing blacklist operation",
      error: err.message,
    });
  }
};

exports.removeUserFromBlacklist = async (req, res, next) => {
  try {
    const { user_id, client_id, app_id } = req.head;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);

    if (!clientExist || !appExist || !userExist) return;

    const userBan = await prisma.user_blacklist.findFirst({
      where: {
        user_id: Number(user_id),
        app_id: Number(app_id),
      },
    });
    if (!userBan)
      return res
        .status(400)
        .json(new Response(400, null, "user not in blacklist"));

    await prisma.user_blacklist.delete({
      where: {
        id: userBan.id,
      },
    });

    return res
      .status(200)
      .json(new Response(200, null, "user removed from blacklist"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error processing blacklist operation",
      error: err.message,
    });
  }
};

// ========= get users =============
// we will get user after authintation
// in req head we will get client id
// all return a array  of user data
// ========== all users ============

exports.getAllUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const result = await fetchUsersByStatus(client_id);

    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "User fetched"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error getting all user",
      error: err.message,
    });
  }
};

// ======= active user ==============
exports.getActiveUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const result = await fetchUsersByStatus(client_id,true);

    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "Active user fetched"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error active all user",
      error: err.message,
    });
  }
};

// ============= not active user =================
exports.getInactiveUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const result = await fetchUsersByStatus(client_id,false);

    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "Inactive user fetched"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error getting inactive user",
      error: err.message,
    });
  }
};

// ============ get baned users ===========
exports.getBanUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const query = `
    SELECT u.first_name,u.last_name,u.email,u.mobile_no,a.app_name,u.active,
    'banned' AS status
    FROM user u
    JOIN client_schema."App" a ON u.app_id=a.id
    JOIN user_blacklist ub ON ub.user_id=u.id
    WHERE a.client_id=${client_id};
  `;

  const result = await pool.query(query)
     if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "banned user fetched"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error getting banned user",
      error: err.message,
    });
  }
};

// helper functions

/**
 * 
 * @param client_id it will a int that will define for client id
 * @param status it will a bool that will define for active user or not 
 * @returns we will return a array of users that active,not or both
 */
async function fetchUsersByStatus(client_id,status = null) {
  let whereClause = "";
  if (status === true) whereClause = "WHERE u.active=true";
  else if (status === false) whereClause = "WHERE u.active=false";

  const query = `
    SELECT u.first_name,u.last_name,u.email,u.mobile_no,a.app_name,u.active
    FROM user u
    JOIN client_schema."App" a ON u.app_id=a.id
    WHERE a.client_id=${client_id}
    ${whereClause};
  `;
  return pool.query(query);
}

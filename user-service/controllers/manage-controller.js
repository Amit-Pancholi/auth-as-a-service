const { check, validationResult } = require("express-validator");
const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");
// const { findInTableById } = require("../utils/db-query");
const bcrypt = require("bcrypt");
// const user_url = process.env.USER_SERVICE_URL;
// const token_url = process.env.TOKEN_SERVICE_URL;
// const rbac_url = process.env.RBAC_SERVICE_URL;
// all token data come in req head
exports.postDeleteUser = async (req, res, next) => {
  try {
    const { user_id, client_id, app_id } = req.head;
    // let client_id = 1;
    // let user_id = 2;
    // let app_id = 1;

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
    return res
      .status(500)
      .json(new Response(500, null, "Error removing user " + err));
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
      return res
        .status(500)
        .json(new Response(500, null, "Error updating user " + err));
    }
  },
];

// adding and removing user from blacklist by client
// user id and client id will send through res head and also check user is block or not through middlewar
exports.postBanUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const { app_id, user_id } = req.body;

    // let client_id = 1;
    // let user_id = 3;
    // let app_id = 1;
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
    // console.log(user_id, app_id);
    // console.log(userBan);
    if (userBan)
      return res
        .status(200)
        .json(new Response(200, null, "user already in blacklist"));

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
    return res
      .status(500)
      .json(new Response(500, null, "Error blacklisting operation " + err));
  }
};

exports.removeUserFromBlacklist = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const { user_id, app_id } = req.body;
    // let client_id = 1;
    // let user_id = 3;
    // let app_id = 1;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);
    console.log(client_id, user_id, app_id);
    if (!clientExist || !appExist || !userExist) return;
    // if (clientExist.id != appExist.client_id || appExist.id != userExist.app_id)
    //   return res
    //     .status(400)
    //     .json(new Response(400, null, "client,app,user not related"));
    // console.log("hello");

    const userBan = await prisma.user_blacklist.findFirst({
      where: {
        user_id: Number(user_id),
        app_id: Number(app_id),
      },
    });
    // console.log(userBan);
    if (!userBan)
      return res
        .status(200)
        .json(new Response(200, null, "user not in blacklist"));

    await prisma.user_blacklist.delete({
      where: {
        id: userBan.id,
      },
    });

    return res
      .status(200)
      .json(new Response(200, null, "user removed from blacklist"));
  } catch (err) {
    return res
      .status(500)
      .json(new Response(500, null, "Error blacklisting operation " + err));
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
    // let client_id = 1
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    // console.log(clientExist)
    const result = await fetchAllUnbannedUsers(client_id);

    // console.log(result.rows);

    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "User fetched"));
  } catch (err) {
    return res
      .status(500)
      .json(new Response(500, null, "Error getting user " + err));
  }
};

// ======= active user ==============
exports.getActiveUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    // let client_id = 1;
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const result = await fetchUsersByStatus(client_id, true);

    // console.log(result);

    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "Active user fetched"));
  } catch (err) {
    return res
      .status(500)
      .json(new Response(500, null, "Error fetching user " + err));
  }
};

// ============= not active user =================
exports.getInactiveUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    // let client_id = 1
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const result = await fetchUsersByStatus(client_id, false);

    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not available"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "Inactive user fetched"));
  } catch (err) {
    return res
      .status(500)
      .json(new Response(500, null, "Error fetching user " + err));
  }
};

// ============ get baned users ===========
exports.getBanUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    // let client_id = 1
    const clientExist = await checkClient(client_id);

    if (!clientExist) return;

    const query = `
    SELECT u.id,u.first_name,u.last_name,u.email,u.mobile_no,a.id AS "app_id",a.app_name,u.active,
    'banned' AS status
    FROM user_schema.user u
    JOIN user_schema.user_blacklist ub ON ub.user_id=u.id
    JOIN client_schema."App" a ON a.id=u.app_id
    WHERE a.client_id=$1;
  `;

    const result = await pool.query(query, [client_id]);
    // console.log(result.rows);
    if (result?.rows?.length == 0)
      return res.status(200).json(new Response(200, [], "User not blacklist"));

    return res
      .status(200)
      .json(new Response(200, result?.rows, "banned user fetched"));
  } catch (err) {
    return res
      .status(500)
      .json(new Response(500, null, "Error fetching banned user " + err));
  }
};

// helper functions

/**
 *
 * @param client_id it will a int that will define for client id
 * @param status it will a bool that will define for active user or not
 * @returns we will return a array of users that active,not or both
 */
async function fetchUsersByStatus(client_id, status = null) {
  let whereClause = "";
  if (status === true) whereClause = "AND u.active=true";
  else if (status === false) whereClause = "AND u.active=false";

  const query = `
    SELECT u.id,u.first_name,u.last_name,u.email,a.id AS "app_id",u.mobile_no,a.app_name,u.active
    FROM user_schema.user u
    JOIN client_schema."App" a ON u.app_id=a.id
    WHERE a.client_id=${client_id} ${whereClause};
  `;
  return pool.query(query);
}

/**
 *
 * @param client_id it will a int that will define for client id
 * @param status it will a bool that will define for active user or not
 * @returns we will return a array of users that active,not or both
 */
async function fetchAllUnbannedUsers(client_id) {
  const query = `
    SELECT u.id,u.first_name,u.last_name,u.email,u.mobile_no,a.id AS "app_id",a.app_name,u.active
    FROM user_schema.user u
    JOIN client_schema."App" a ON u.app_id=a.id
    WHERE a.client_id=${client_id} AND u.id NOT IN (
      SELECT ub.user_id
      FROM user_schema.user_blacklist ub
      JOIN client_schema."App" a2 ON ub.app_id=a2.id
      WHERE a2.client_id=${client_id}
    );
  `;
  return pool.query(query);
}

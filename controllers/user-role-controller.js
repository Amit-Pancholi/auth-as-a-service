const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");
// const { query } = require("express-validator");

// ======== add role to user ==============
// we will provude client,user and app id through req head
// provide role through url
// provide app and user id in req body
exports.postAddRoleToUser = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    // const client_id = 1
    const { user_id, app_id } = req.body;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);

    if (!clientExist || !userExist || !appExist) return;

    if (
      userExist.app_id !== Number(app_id) ||
      appExist.client_id !== Number(client_id)
    ) {
      return res
        .status(400)
        .json(
          new Response(400, null, "User not associated with this client or app")
        );
    }
    const assinedRole = await prisma.user_role.findFirst({
      where: {
        user_id: Number(user_id),
        app_id: Number(app_id),
      },
    });

    if (assinedRole)
      return res
        .status(400)
        .json(
          new Response(
            400,
            null,
            "user already have a role so you will update that role or remove"
          )
        );

    const role_id = req.params.roleId;
    const roleExist = await prisma.role.findUnique({
      where: {
        id: Number(role_id),
      },
    });
    if (!roleExist || roleExist.active === false)
      return res
        .status(404)
        .json(new Response(404, null, "role not found or removed"));

    const addRole = await prisma.user_role.create({
      data: {
        user_id: Number(user_id),
        app_id: Number(app_id),
        role_id: Number(role_id),
      },
    });

    return res.status(201).json(
      new Response(
        201,
        {
          user: {
            name: userExist.first_name + " " + userExist.last_name,
            email: userExist.email,
            role: roleExist.name,
          },
        },
        "Successfully add role to user"
      )
    );
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error add role to user",
      error: err.message,
    });
  } finally {
    await prisma.$disconnect().catch((err) => {
      console.log("error in disconnect: " + err.message);
    });
  }
};

// ========== update user role ===========
// we will provude client id through req head
// provide new role through url
// provide user and app id through body
exports.postUpdateRole = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    // const client_id = 1;
    const { user_id, app_id } = req.body;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);

    if (!clientExist || !userExist || !appExist) return;

    if (
      userExist.app_id !== Number(app_id) ||
      appExist.client_id !== Number(client_id)
    ) {
      return res
        .status(400)
        .json(
          new Response(400, null, "User not associated with this client or app")
        );
    }
    const assinedRole = await prisma.user_role.findFirst({
      where: {
        user_id: Number(user_id),
        app_id: Number(app_id),
      },
    });
    if (!assinedRole)
      return res
        .status(404)
        .json(
          new Response(
            404,
            null,
            "User does not have any assigned role (defaults to guest)"
          )
        );

    const role_id = req.params.roleId;
    if (role_id == assinedRole.id)
      return res
        .status(200)
        .json(new Response(200, null, "you already assined this role to user"));
    const roleExist = await prisma.role.findUnique({
      where: {
        id: Number(role_id),
      },
    });
    if (!roleExist || roleExist.active === false)
      return res
        .status(404)
        .json(new Response(404, null, "role not found or removed"));

    const roleUpdate = await prisma.user_role.update({
      where: {
        id: assinedRole.id,
      },
      data: {
        role_id: Number(role_id),
      },
    });

    return res.status(200).json(
      new Response(
        200,
        {
          user: {
            name: userExist.first_name + " " + userExist.last_name,
            email: userExist.email,
            role: roleExist.name,
          },
        },
        "role updated successfully"
      )
    );
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error updating role of user",
      error: err.message,
    });
  } finally {
    await prisma.$disconnect().catch((err) => {
      console.log("error in disconnect: " + err.message);
    });
  }
};

//======== removed role from user =========
// we will provude client id through req head
// user role id through url
exports.deleteRoleFromUser = async (req, res, next) => {
  try {
    const { client_id} = req.head;
    // const client_id = 1;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;

    const user_role_id = req.params.URId;
    const assinedRole = await prisma.user_role.findUnique({
      where: {
        id: Number(user_role_id)
      },
    });
    if (!assinedRole)
      return res
        .status(404)
        .json(
          new Response(
            404,
            null,
            "User does not have any assigned role (defaults to guest)"
          )
        );

    const removeRole = await prisma.user_role.delete({
      where: {
        id: assinedRole.id,
      },
    });
    return res
      .status(200)
      .json(new Response(200, null, "role removed from user successfully"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error removing role from user",
      error: err.message,
    });
  } finally {
    await prisma.$disconnect().catch((err) => {
      console.log("error in disconnect: " + err.message);
    });
  }
};

// ======= get all user assined with role ===========
// provide client id in head

exports.getAllRoledUser = async (req, res, next) => {
  try {
    const { client_id} = req.head;
    // const client_id = 1;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;

    const query = `SELECT ur.id AS user_role_id,u.first_name,u.last_name,u.email,u.mobile_no,a.app_name,r.name AS role
     FROM rbac_schema.user_role ur
     JOIN rbac_schema.role r ON ur.role_id=r.id
     JOIN user_schema.user u ON u.id=ur.user_id
     JOIN client_schema."App" a ON a.id=ur.app_id
     WHERE u.active=true AND r.active=true AND a.client_id=$1;`;

    const result = await pool.query(query, [client_id]);

    if (result.rows.length == 0)
      return res
        .status(200)
        .json(
          new Response(
            200,
            [],
            "there no data exist to related to role and user"
          )
        );
    return res
      .status(200)
      .json(
        new Response(
          200,
          result.rows,
          "successfully fetch user and related role"
        )
      );
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error role and related user",
      error: err.message,
    });
  }
};

// ============ get  user assined with role according to app ===================

// provide client id in head
//  app id in url
exports.getAllRoledUsersByApp = async (req, res, next) => {
  try {
    const { client_id} = req.head;
    // const client_id = 1
    const  app_id  = req.params.appId;
    console.log(app_id)
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);

    if (!clientExist || !appExist) return;

    if (appExist.client_id !== Number(client_id)) {
      return res
        .status(400)
        .json(new Response(400, null, "app not associated with this client"));
    }

    const query = `SELECT ur.id AS user_role_id,u.first_name,u.last_name,u.email,u.mobile_no,a.app_name,r.name AS role_name
     FROM rbac_schema.user_role ur
     JOIN rbac_schema.role r ON ur.role_id=r.id
     JOIN user_schema.user u ON u.id=ur.user_id
     JOIN client_schema."App" a ON a.id=ur.app_id
     WHERE u.active=true AND r.active=true AND a.client_id=$1 AND a.id=$2;`;

    const result = await pool.query(query, [client_id, app_id]);

    if (result.rows.length == 0)
      return res
        .status(200)
        .json(
          new Response(
            200,
            [],
            "there no data exist to related to role and user"
          )
        );
    return res
      .status(200)
      .json(
        new Response(
          200,
          result.rows,
          "successfully fetch user and related role"
        )
      );
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error fetching role and related user",
      error: err.message,
    });
  }
};

// ========== get user role for single user ===============
// this will only call by internal service for getting role
// provide userId through url
exports.getSingleUserRole = async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const userExist = await checkUser(user_id, res);
    if (!userExist) return;

    const appExist = await checkApp(userExist.app_id,res);

    if(!appExist) return;

    const query = `SELECT ur.id AS user_role_id,r.name AS user_role
    FROM role r
    JOIN user_role ur ON ur.role_id=r.id
    WHERE ur.user_id=$1;`;

    const result = await pool.query(query, [user_id]);
    if (result.rows.length === 0)
      return res
        .status(200)
        .json(new Response(200, {}, "there is no role assined to this user"));

    return res
      .status(200)
      .json(
        new Response(200, result.rows[0], "role fetch successfully for user")
      );
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error role and related user",
      error: err.message,
    });
  }
};

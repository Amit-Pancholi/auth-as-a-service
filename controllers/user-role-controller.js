const { check, validationResult } = require("express-validator");
const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");

// ======== add role to user ==============
// we will provude client,user and app id through req head
// provide role through url
exports.postAddRoleToUser = async (req, res, next) => {
  try {
    const { client_id, user_id, app_id } = req.head;
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
    if (!roleExist)
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
// we will provude client,user and app id through req head
// provide new role through url

exports.postUpdateRole = async (req, res, next) => {
  try {
    const { client_id, user_id, app_id } = req.head;
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
    const roleExist = await prisma.role.findUnique({
      where: {
        id: Number(role_id),
      },
    });
    if (!roleExist)
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
// we will provude client,user and app id through req head
exports.deleteRoleFromUser = async (req, res, next) => {
  try {
    const { client_id, user_id, app_id } = req.head;
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
    if (assinedRole.app_id !== Number(app_id)) {
      return res
        .status(400)
        .json(new Response(400, null, "Role not related to this app"));
    }

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
// provide client,app id in head

exports.getAllRoledUser = async (req,res,next) => {
  try {
     const { client_id,app_id } = req.head;
     const clientExist = await checkClient(client_id, res);
     const appExist = await checkApp(app_id, res);

     if (!clientExist || !appExist) return;

     if (
       appExist.client_id !== Number(client_id)
     ) {
       return res
         .status(400)
         .json(
           new Response(
             400,
             null,
             "app not associated with this client"
           )
         );
     }
     
     const query = `SELECT u.first_name,u.last_name,u.email,u.mobile_no,a.app_name,r.name AS role_name
     FROM user_role ur
     JOIN role r ON ur.role_id=r.id
     JOIN user_schema.user u ON u.id=ur.user_id
     JOIN client_schema."App" a ON a.id=ur.app_id
     WHERE u.active=true AND r.active=true;`

     const result = await pool.query(query)

     if(result.rows.length == 0) return res.status(200).json(new Response(200,[],"there no data exist to related to role and user"))
      return res.status(200).json(new Response(200,result.rows,"successfully fetch user and related role"))
    } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error role and related user",
      error: err.message,
    });
  }
}
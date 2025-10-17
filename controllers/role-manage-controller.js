const { check, validationResult } = require("express-validator");
const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");

// =========== role creating =========
// provide client id and app id in req head
exports.postCreateRole = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("role must not empty")
    .isLength({
      min: 3,
    })
    .withMessage("role must be three character long")
    .matches(/^[\w\s-]+$/)
    .withMessage("role can only contain letters, numbers, spaces, or hyphens"),
  check("description").trim().isString(),
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
      const { client_id, app_id } = req.head;
      const clientExist = await checkClient(client_id, res);
      const appExist = await checkApp(app_id, res);

      if (!clientExist || !appExist) return;

      const { name, description } = req.body;
      const existingRole = await prisma.role.findFirst({
        where: {
          name,
          app_id: Number(app_id),
          client_id: Number(client_id),
          active: true,
        },
      });

      if (existingRole)
        return res
          .status(400)
          .json(new Response(400, null, "Role already exists"));

      const role = await prisma.role.create({
        data: {
          name,
          description,
          client_id: Number(client_id),
          app_id: Number(app_id),
        },
      });

      return res
        .status(201)
        .json(new Response(201, role, "role created successfully"));
    } catch (err) {
      return res.status(500).json({
        status: "failure",
        Message: "Error creating role",
        error: err.message,
      });
    }
  },
];

// ========== update role ================
// provide role id through url
// client and app id in req head

exports.putUpdateRole = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("role must not empty")
    .isLength({
      min: 3,
    })
    .withMessage("role must be three character long")
    .matches(/^[\w\s-]+$/)
    .withMessage("role can only contain letters, numbers, spaces, or hyphens"),
  check("description").trim().isString(),
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
      const { client_id, app_id } = req.head;
      const clientExist = await checkClient(client_id, res);
      const appExist = await checkApp(app_id, res);

      if (!clientExist || !appExist) return;
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

      if (
        roleExist.client_id != Number(client_id) ||
        roleExist.app_id != Number(app_id)
      )
        return res
          .status(400)
          .json(
            new Response(400, null, "bad request client or role not relate")
          );

      const { name, description } = req.body;

      const existingRole = await prisma.role.findFirst({
        where: {
          name,
          app_id: Number(app_id),
          client_id: Number(client_id),
          active: true,
        },
      });

      if (existingRole)
        return res
          .status(400)
          .json(new Response(400, null, "Role already exists with this name"));

      const role = await prisma.role.update({
        where: {
          id: Number(role_id),
        },
        data: {
          name,
          description,
        },
      });
      return res
        .status(200)
        .json(new Response(200, role, "role updated successfully"));
    } catch (err) {
      return res.status(500).json({
        status: "failure",
        Message: "Error updating role",
        error: err.message,
      });
    }
  },
];

// ======== delete role ============
// provide role id through url
//client and app id  in req head
exports.deleteRole = async (req, res, next) => {
  try {
    const { client_id, app_id } = req.head;
    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);

    if (!clientExist || !appExist) return;

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

    if (
      roleExist.client_id != Number(client_id) ||
      roleExist.app_id != Number(app_id)
    )
      return res
        .status(400)
        .json(new Response(400, null, "bad request client or role not relate"));
    const updatedRole = await prisma.role.update({
      where: { id: Number(role_id) },
      data: {
        active: false,
      },
    });
    return res
      .status(200)
      .json(new Response(200, updatedRole, "role removed successfully"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error removing role",
      error: err.message,
    });
  }
};

// ==== get all role =========
// provide client id in req head
exports.getAllRole = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;

    const query = `
    SELECT r.id,r.name,r.description,c.first_name,c.last_name,a.app_name,r."createdAt",r."updatedAt"
    FROM client_schema."role" r
    JOIN client_schema."Client" c ON c.id = r.client_id
    JOIN client_schema."App" a ON a.id = r.app_id
    WHERE c.id =$1 AND r.active = true;`;

    const role = await pool.query(query, [client_id]);
    if (role.rows.length == 0)
      return res.status(200).json(new Response(200, [], "No role exist"));
    return res.status(200).json(new Response(200, role.rows, "fetched roles"));
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      Message: "Error getting role",
      error: err.message,
    });
  }
};

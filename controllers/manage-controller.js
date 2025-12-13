const { check, validationResult } = require("express-validator");
const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const Response = require("../utils/response-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pool = require("../utils/db-connection");
const jwt = require("jsonwebtoken");
const { findInTableById } = require("../utils/db-query");
const JWT_URL_SECRET = process.env.JWT_URL_SECRET;
const user_url = process.env.USER_SERVICE_URL;
const token_url = process.env.TOKEN_SERVICE_URL;
const rbac_url = process.env.RBAC_SERVICE_URL;
const user_access_url = process.env.USER_ACCESS

exports.getUrlAndToken = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const { app_id } = req.body;

    const appExist = await checkApp(app_id, res);
    const clientExist = await checkClient(client_id, res);
    if (!appExist || !clientExist) return;

    let token = jwt.sign(
      { client_id: clientExist.id, app_id: appExist.id },
      JWT_URL_SECRET
    );

    return res.status(200).json(
      new Response(200, {
        url: `${user_access_url||user_url}/api/AaaS/user/v1`,
        token: token,
      })
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error genrating url"));
  }
};

exports.getAllUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${user_url}/api/AaaS/user/v1?action=all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      console.log(response);
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "User service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "User service not work"));

    const user = responseData?.data;
    if (user.length === 0) {
      return res.status(200).json(new Response(200, [], "User not found"));
    }
    return res
      .status(200)
      .json(new Response(200, user, "user fetched successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error getting user"));
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const {user_id,app_id} = req.body
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${user_url}/api/AaaS/user/v1?action=ban`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          user_id,
          app_id,
        }),
      }
    );
    // console.log(response)
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "User service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "User service not work"));

    return res
      .status(200)
      .json(new Response(200, null, "blacklist user successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error getting user"));
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const {user_id,app_id} = req.body
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${user_url}/api/AaaS/user/v1?action=unban`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          user_id,
          app_id,
        }),
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "User service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "User service not work"));

    return res
      .status(200)
      .json(new Response(200, null, "unban user fetched successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error getting user"));
  }
};

exports.getBannedUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${user_url}/api/AaaS/user/v1?action=banned`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "User service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "User service not work"));

    const user = responseData?.data;
    if (user.length === 0) {
      return res.status(200).json(new Response(200, [], "User not found"));
    }
    return res
      .status(200)
      .json(new Response(200, user, "banned user fetched successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error getting banned user"));
  }
};

exports.getActiveUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${user_url}/api/AaaS/user/v1?action=active`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "User service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "User service not work"));

    const user = responseData?.data;
    if (user.length === 0) {
      return res.status(200).json(new Response(200, [], "User not found"));
    }
    return res
      .status(200)
      .json(new Response(200, user, "active user fetched successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error getting user"));
  }
};

exports.getInactiveUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${user_url}/api/AaaS/user/v1?action=inactive`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "User service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "User service not work"));

    const user = responseData?.data;
    if (user.length === 0) {
      return res.status(200).json(new Response(200, [], "User not found"));
    }
    return res
      .status(200)
      .json(new Response(200, user, "active user fetched successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error getting user"));
  }
};

exports.postAddAndUpdateSecret = [
  check("secret").trim().notEmpty().withMessage("Please enter a secret"),
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
      return res.status(500).json(new Response(500, null, "bad request"));
    }
  },
  async (req, res, next) => {
    try {
      const {client_id} = req.head
      const {  app_id, secret } = req.body;

      const clientExist = await checkClient(client_id, res);
      const appExist = await checkApp(app_id, res);

      if (!clientExist || !appExist) return;

      if (clientExist.id != appExist.client_id)
        return res
          .status(400)
          .json(
            new Response(400, null, "Client and app not related to each other")
          );

      const updateApp = await prisma.App.update({
        where: {
          id: appExist.id,
        },
        data: {
          secret,
        },
      });
      return res.status(200).json(
        new Response(
          200,
          {
            app_name: appExist.app_name,
            secret,
          },
          "secret update successfully"
        )
      );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(new Response(500, null, "Error adding and update secret"));
    }
  },
];

exports.getSecret = async (req, res, next) => {
  try {
    const {client_id} = req.head
    const { app_id } = req.body;

    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);

    if (!clientExist || !appExist) return;

    if (clientExist.id != appExist.client_id)
      return res
        .status(400)
        .json(
          new Response(400, null, "Client and app not related to each other")
        );

    return res
      .status(200)
      .json(
        new Response(
          200,
          { name: appExist.app_name, secret: appExist.secret },
          "Secret fetch successfully"
        )
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error fetching secret"));
  }
};

exports.postCreateRole = async (req, res, next) => {
  try {
    const {client_id} = req.head
    const {  app_id, name, description } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));
    const appExist = await checkApp(app_id, res);
    const clientExist = await checkClient(client_id, res);
    if (!appExist || !clientExist) return;
    if (clientExist.id != appExist.client_id)
      return res
        .status(400)
        .json(
          new Response(400, null, "Client and app not related to each other")
        );

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/v1/create/${app_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const role = responseData?.data;

    return res
      .status(200)
      .json(new Response(200, role, "role created successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error creating role"));
  }
};

exports.putUpdateRole = async (req, res, next) => {
  try {
    const { role_id, name, description } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const roleExist = await findInTableById("role", "rbac_schema", role_id);

    if (!roleExist)
      return res.status(404).json(new Response(404, null, "role not found"));

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/v1/update/${role_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const role = responseData?.data;

    return res
      .status(200)
      .json(new Response(200, role, "role update successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error updating role"));
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const { role_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const roleExist = await findInTableById("role", "rbac_schema", role_id);

    if (!roleExist)
      return res.status(404).json(new Response(404, null, "role not found"));

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/v1/delete/${role_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));


    return res
      .status(200)
      .json(new Response(200, null, "role removed successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error removing role"));
  }
};

exports.getRoles = async (req, res, next) => {
  try {
    // const { client_id, app_id, role_id, name, description } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(`${rbac_url}/api/AaaS/rbac/v1/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const role = responseData?.data;
    if (!role)
      return res.status(404).json(new Response(404, [], "role not found"));

    return res
      .status(200)
      .json(new Response(200, role, "role fetch successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new Response(500, null, "Error creating role"));
  }
};

exports.postAssinRole = async (req, res, next) => {
  try {
    const { role_id, user_id, app_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);

    if (!userExist || !appExist) return;

    if (userExist.app_id != appExist.id)
      return res
        .status(400)
        .json(
          new Response(400, null, "user and app not related to each other")
        );
    const roleExist = await findInTableById("role", "rbac_schema", role_id);

    if (!roleExist)
      return res.status(404).json(new Response(404, null, "role not found"));

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/user/v1/add/${role_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          user_id,
          app_id,
        }),
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const roleWithUser = responseData?.data;

    return res
      .status(200)
      .json(new Response(200, roleWithUser, "role add successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error adding role to user"));
  }
};
exports.getRolesByAppId = async (req, res, next) => {
  try {
     const {app_id } = req.body;
     const token = req.headers.authorization;
     if (!token)
       return res
         .status(401)
         .json(new Response(401, null, "Missing Authorization token"));

     const appExist = await checkApp(app_id, res);
    

     if ( !appExist) return;

     const response = await fetch(
       `${rbac_url}/api/AaaS/rbac/v1/app/${app_id}`,
       {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           Authorization: token,
         },
       }
     );
     if (!response.ok) {
       return res
         .status(response.status)
         .json(
           new Response(response.status, null, "Rbac service returned error")
         );
     }
     const responseData = await response.json();
     if (!responseData)
       return res
         .status(503)
         .json(new Response(503, null, "Rbac service not work"));

     const role = responseData?.data;

     return res
       .status(200)
       .json(new Response(200, role, "role fetch successfully"));
  } catch (err) {
     console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error fetching role to user"));
  }
}
exports.putUpdateAssinRole = async (req, res, next) => {
  try {
    const { ur_id,role_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    // const appExist = await checkApp(app_id, res);
    // const userExist = await checkUser(user_id, res);

    // if (!userExist || !appExist) return;

    // if (userExist.app_id != appExist.id)
    //   return res
    //     .status(400)
    //     .json(
    //       new Response(400, null, "user and app not related to each other")
    //     );
    const roleExist = await findInTableById("role", "rbac_schema", role_id);

    if (!roleExist)
      return res.status(404).json(new Response(404, null, "role not found"));

    // const assignedRole = await findInTableById("user_role", "rbac_schema", ur_id);

    const query = `select * from rbac_schema.user_role ur where ur.id=$1;`;
    const assignedRole =  await pool.query( query, [ur_id]);
    if (assignedRole.rows.length === 0)
      return res.status(404).json(new Response(404, null, "assigned role not found"));

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/user/v1/update/${role_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          ur_id,
        }),
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const roleWithUser = responseData?.data;

    return res
      .status(200)
      .json(new Response(200, roleWithUser, "role updating successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error updating role to user"));
  }
};

exports.deleteAssinRole = async (req, res, next) => {
  try {
    const { ur_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

        const query = `select * from rbac_schema.user_role ur where ur.id=$1;`; 
    const urExist = await pool.query(query,[ur_id])

    if (!urExist)
      return res
        .status(404)
        .json(new Response(404, null, "user and role not found"));

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/user/v1/remove/${ur_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));


    return res
      .status(200)
      .json(new Response(200,null, "role remove successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error removing role to user"));
  }
};

exports.getAlluserWithAssinRole = async (req, res, next) => {
  try {
    // const { role_id, user_id, app_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/user/v1/all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const roleWithUser = responseData?.data;

    return res
      .status(200)
      .json(
        new Response(
          200,
          roleWithUser,
          "role and related user fetch successfully"
        )
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error fetch role to user"));
  }
};

exports.getAlluserWithAssinRoleByAppId = async (req, res, next) => {
  try {
    const { app_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const appExist = await checkApp(app_id, res);
    if (!appExist) return;

    const response = await fetch(
      `${rbac_url}/api/AaaS/rbac/user/v1/app/${app_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "Rbac service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const roleWithUser = responseData?.data;

    return res
      .status(200)
      .json(
        new Response(
          200,
          roleWithUser,
          "role and related user fetch successfully"
        )
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error fetch role to user"));
  }
};

exports.getUserWithToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${token_url}/api/AaaS/token/v1/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    console.log(response);
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "token service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "token service not work"));

    const tokenWithUser = responseData?.data;

    if (!tokenWithUser)
      return res.status(404).json(new Response(404, [], "user not found"));

    return res
      .status(200)
      .json(
        new Response(
          200,
          tokenWithUser,
          "user and related token fetch successfully"
        )
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error fetch token to user"));
  }
};
exports.getUserWithTokenByApp = async (req, res, next) => {
  try {
    const { app_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const appExist = await checkApp(app_id, res);
    if (!appExist) return;

    const response = await fetch(
      `${token_url}/api/AaaS/token/v1/app/${app_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "token service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "token service not work"));

    const tokenWithUser = responseData?.data;

    if (!tokenWithUser)
      return res.status(404).json(new Response(404, [], "user not found"));

    return res
      .status(200)
      .json(
        new Response(
          200,
          tokenWithUser,
          "user and related token fetch successfully"
        )
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error fetch token to user"));
  }
};

exports.postAddApps = [
  // 🔹 Field validations
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

  // 🔹 Validation handler
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(
          new Response(
            400,
            null,
            errors
              .array()
              .map((e) => e.msg)
              .join(", ")
          )
        );
      }
      next();
    } catch (error) {
      return res.status(500).json(new Response(500, null, "Bad request"));
    }
  },

  // 🔹 Main logic
  async (req, res) => {
    try {
      const { client_id } = req.head;
      const clientExist = await checkClient(client_id, res);
      if (!clientExist) return;

      const { app_name, description, secret } = req.body;
      if (!app_name || !description || !secret) {
        return res
          .status(400)
          .json(new Response(400, null, "All fields required"));
      }

      const appExist = await prisma.App.findFirst({
        where: { app_name, client_id, active: true },
      });

      if (appExist) {
        return res
          .status(400)
          .json(new Response(400, null, "App with same name already exists"));
      }

      const app = await prisma.App.create({
        data: { app_name, client_id, description, secret },
      });

      return res.status(201).json(
        new Response(
          201,
          {
            app: {
              name: app.app_name,
              description: app.description,
            },
          },
          "App created successfully"
        )
      );
    } catch (err) {
      console.error(err);
      return res.status(500).json(new Response(500, null, "Error adding app"));
    }
  },
];

exports.putUpdateApps = [
  // 🔹 Field validations
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

  // 🔹 Validation handler
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(
          new Response(
            400,
            null,
            errors
              .array()
              .map((e) => e.msg)
              .join(", ")
          )
        );
      }
      next();
    } catch (error) {
      return res.status(500).json(new Response(500, null, "Bad request"));
    }
  },

  // 🔹 Main logic
  async (req, res) => {
    try {
      const {client_id} = req.head;
      const clientExist = await checkClient(client_id, res);
      if (!clientExist) return;

      const { app_name, description } = req.body;
      const app_id = req.params.appId;
      if (!app_name || !description) {
        return res
          .status(400)
          .json(new Response(400, null, "All fields required"));
      }

      const appExist = await prisma.App.findFirst({
        where: { id: Number(app_id) },
      });

      if (!appExist || appExist.active == false) {
        return res
          .status(400)
          .json(new Response(400, null, "App does not exists"));
      }

      const app = await prisma.App.update({
        where: {
          id: appExist.id,
        },
        data: { app_name, description },
      });

      return res.status(200).json(
        new Response(
          200,
          {
            app: {
              name: app.app_name,
              description: app.description,
            },
          },
          "App updated successfully"
        )
      );
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json(new Response(500, null, "Error updating app"));
    }
  },
];

exports.getApp = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;

    const apps = await prisma.App.findMany({
      where: {
        client_id,
      },
    });
    if (apps.length == 0)
      return res.status(200).json(new Response(200, [], "App not found"));

    return res
      .status(200)
      .json(new Response(200, apps, "App fetch successfully"));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new Response(500, null, "Error fetching app"));
  }
};
exports.getAppById = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;
    const app_id = req.params.appId;
    const appExist = await prisma.App.findUnique({
      where: {
        id: Number(app_id),
      },
    });

    if (clientExist.id != appExist.client_id)
      return res
        .status(400)
        .json(
          new Response(400, null, "client and app not related to each other")
        );
    if (!appExist)
      return res.status(200).json(new Response(200, null, "App not found"));

    return res
      .status(200)
      .json(new Response(200, appExist, "App fetch successfully"));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new Response(500, null, "Error fetching app"));
  }
};
exports.deleteApp = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);
    if (!clientExist) return;

    const app_id = req.params.appId;

    const appExist = await prisma.App.findUnique({
      where: {
        id: Number(app_id),
      },
    });

    if (!appExist || appExist?.active == false) {
      return res
        .status(400)
        .json(new Response(400, null, "App does not exists"));
    }

    const app = await prisma.App.update({
      where: {
        id: appExist.id,
      },
      data: { active: false },
    });

    return res.status(200).json(
      new Response(
        200,
        {
          app: {
            name: app.app_name,
            description: app.description,
          },
        },
        "App removed successfully"
      )
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new Response(500, null, "Error removing app"));
  }
};

exports.postRemoveUserToken = async (req, res, next) => {
  try {
    const { token_id } = req.body;
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json(new Response(401, null, "Missing Authorization token"));

    const response = await fetch(
      `${token_url}/api/AaaS/token/v1/by-client/${token_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json(
          new Response(response.status, null, "token service returned error")
        );
    }
    const responseData = await response.json();
    if (!responseData)
      return res
        .status(503)
        .json(new Response(503, null, "token service not work"));

    const tokenWithUser = responseData?.data;

    if (!tokenWithUser)
      return res.status(404).json(new Response(404, [], "user not found"));

    return res
      .status(200)
      .json(
        new Response(
          200,
          tokenWithUser,
          "user token removed successfully"
        )
      );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new Response(500, null, "Error removing app"));
  }
};
// use in future
async function callService(url, method, token, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Service error: ${response.status}`);
  return response.json();
}


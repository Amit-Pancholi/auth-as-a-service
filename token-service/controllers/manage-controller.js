const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { checkClient, checkApp, checkUser } = require("../utils/check-exist");
const JWT_CLIENT_SECRET = process.env.JWT_CLIENT_SECRET;
const jwt = require("jsonwebtoken");
const pool = require("../utils/db-connection");
const Response = require("../utils/response-handler");
const { findInTableById } = require("../utils/db-query");
// const user_url = process.env.USER_SERVICE_URL;
// const token_url = process.env.TOKEN_SERVICE_URL;
const rbac_url = process.env.RBAC_SERVICE_URL;
// console.log(Object.keys(prisma));
// =========Crete Token============

// need to pass user_id client_id app_id
exports.postGenerateTokenForUser = async (req, res, next) => {
  try {
    const { client_id, user_id, app_id } = req.body;

    // let client_id = 1
    // let app_id = 1
    // let user_id = 2

    if (!client_id || !user_id || !app_id)
      return res
        .status(400)
        .json(new Response(400, null, "All field required"));

    // check user after creating user service

    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);

    if (!clientExist || !userExist || !appExist) return;

    if (
      appExist.client_id != clientExist.id ||
      userExist.app_id != appExist.id
    ) {
      return res
        .status(400)
        .json(new Response(400, null, "user is not related to client or app"));
    }

    const query = `
  select * FROM user_schema.user_blacklist ub
  WHERE ub.user_id=$1;`;

    const result = await pool.query(query, [user_id]);
    if (result.rows.length !== 0)
      return res
        .status(403)
        .json(new Response(403, null, "user is blacklisted by admin"));
    const tokenExist = await prisma.token.findFirst({
      where: {
        user_id: Number(user_id),
        client_id: Number(client_id),
        app_id: Number(app_id),
      },
    });

    // console.log(tokenExist);

    // ============================================
    // call rback api for getting role then use that here
    // call 8003 /role/:userId
    // then add role field in token
    // const roleResponse = await fetch(`http://localhost:8003/role/${user_id}`);
    // const { data: userRole } = await roleResponse.json();

    // const access_token = jwt.sign(
    //   { user_id, client_id, app_id, role: userRole?.name || "guest" },
    //   appExist.secret,
    //   { expiresIn: "1d" }
    // );

    // ============================================
    let roleResponse;
    try {
      roleResponse = await fetch(
        `${rbac_url}/api/AaaS/rbac/user/v1/role/${user_id}`
      );

      if (!roleResponse.ok) {
        let error = await roleResponse.json()
        return res
          .status(error.statusCode)
          .json(
            new Response(
              error.statusCode,
              null,
              "RBAC service returned error " + error.message
            )
          );
      }
    } catch (err) {
      return res
        .status(500)
        .json(new Response(500, null, "Serverside error " + err));
    }
    const roleData = await roleResponse.json();
    if (!roleData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const userRole = roleData?.data;

    const roleName = userRole?.name || "Guest";
    const { access_token, refresh_token } = generateTokens(
      { user_id, client_id, app_id, role: roleName },
      appExist.secret
    );

    if (tokenExist) {
      await prisma.token.update({
        where: { id: tokenExist.id },
        data: { access_token, refresh_token },
      });
      return res
        .status(200)
        .json(
          new Response(200, { access_token, refresh_token }, "Token refreshed")
        );
    }
    await prisma.token.create({
      data: {
        user_id: Number(user_id),
        client_id: Number(client_id),
        app_id: Number(app_id),
        access_token,
        refresh_token,
      },
    });
    return res
      .status(201)
      .json(
        new Response(
          201,
          { access_token, refresh_token },
          "token created successfully"
        )
      );
  } catch (err) {
    // console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Error genrating token " + err));
  }
};

// need to pass client_id
exports.postGenerateTokenForClient = async (req, res, next) => {
  try {
    const { client_id } = req.body;
    // let client_id = 1;

    if (!client_id)
      return res
        .status(400)
        .json(new Response(400, null, "All field required"));

    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;

    const tokenExist = await prisma.client_token.findFirst({
      where: {
        client_id: Number(client_id),
      },
    });
    // console.log(tokenExist);

    const { access_token, refresh_token } = generateTokens(
      { client_id, email: clientExist.email },
      JWT_CLIENT_SECRET
    );
    if (tokenExist) {
      await prisma.client_token.update({
        where: { id: tokenExist.id },
        data: { access_token, refresh_token },
      });
      return res
        .status(200)
        .json(
          new Response(200, { access_token, refresh_token }, "Token refreshed")
        );
    }
    await prisma.client_token.create({
      data: {
        client_id: Number(client_id),
        access_token,
        refresh_token,
      },
    });
    return res
      .status(201)
      .json(
        new Response(
          201,
          { access_token, refresh_token },
          "token created successfully"
        )
      );
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json(
        new Response(
          500,
          null,
          "Internal server error genrating token for client " + err
        )
      );
  }
};
// ========= get single token for client ==============

// provide clientId in url
exports.getTokenForClient = async (req, res, next) => {
  try {
    const client_id = req.params.clientId;

    const query = `SELECT t.id,t.access_token,t.refresh_token,c.first_name,c.last_name,c.email 
    FROM token_schema.client_token t 
    JOIN client_schema."Client" c ON t.client_id=c.id 
    WHERE c.id=$1;`;
    // need to user join table

    const result = await pool.query(query, [client_id]);

    if (result.rows.length === 0)
      return res.status(204).json(new Response(204, null, "empty table"));
    return res
      .status(200)
      .json(new Response(200, result.rows, "searched data"));
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Intrenal server error fetching token " + err));
  }
};

// ============= get token for user ===============
// provide client_id through req head
exports.getAllUserToken = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);
    if (!clientExist) return;

    const query = `SELECT t.id,t.access_token,t.refresh_token,u.first_name,u.last_name,u.email,a.app_name 
    FROM token_schema.token t 
    JOIN client_schema."Client" c ON t.client_id=c.id 
    JOIN client_schema."App" a ON t.app_id=a.id
    JOIN user_schema.user u ON u.id=t.user_id
    WHERE c.id=$1;`;
    // need to user join table

    const result = await pool.query(query, [client_id]);
    // console.log(result.rows);
    // console.log(new Response(204,[],"lsodkfo"))
    if (result.rows.length == 0) {
      // console.log("hellow");
      return res.status(200).json(new Response(200, [], "role not created"));
    }

    //  console.log("hellow");
    return res
      .status(200)
      .json(new Response(200, result.rows, "searched data"));
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Internal server error fetching token " + err));
  }
};
// ======== get token filter ==========

// ===========fileter by app id ==============
// provide client_id through req head
// pass app id through url
exports.getTokenByapp = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;

    const app_id = req.params.appId;
    const appExist = await checkApp(app_id, res);

    if (!appExist) return;

    if (appExist.client_id != clientExist.id) {
      return res
        .status(400)
        .json(new Response(400, null, "client will not relate to app"));
    }

    const query = `SELECT t.id,t.access_token,t.refresh_token,u.first_name,u.last_name,u.email,a.app_name 
    FROM token_schema.token t 
    JOIN client_schema."Client" c ON t.client_id=c.id 
    JOIN client_schema."App" a ON t.app_id=a.id
    JOIN user_schema.user u ON u.id=t.user_id
    WHERE a.id=$1 AND c.id=$2;`;

    const result = await pool.query(query, [app_id, client_id]);
    if (result.rows.length === 0)
      return res.status(204).json(new Response(204, null, "empty table"));
    return res
      .status(200)
      .json(new Response(200, result.rows, "filtered data"));
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Internal server error fetching token " + err));
  }
};

// ============= update token================
// pass refresh token and middleware add data(id's) in head
exports.putUpdateTokenForUser = async (req, res, next) => {
  try {
    const { client_id, user_id, app_id } = req.head;
    if (!client_id || !user_id || !app_id)
      return res
        .status(400)
        .json(new Response(400, null, "All data required"));

    const clientExist = await checkClient(client_id, res);
    const appExist = await checkApp(app_id, res);
    const userExist = await checkUser(user_id, res);

    if (!appExist || !clientExist || !userExist) return;

    if (
      appExist.client_id != clientExist.id ||
      userExist.app_id != appExist.id
    ) {
      return res
        .status(400)
        .json(new Response(400, null, "user is not related to client or app"));
    }
    const query = `
    select * FROM user_schema.user_blacklist ub
    WHERE ub.user_id=$1;`;

    const result = await pool.query(query, [user_id]);

    if (result.rows.length !== 0)
      return res
        .status(403)
        .json(new Response(403, null, "user is blacklisted by admin"));
    const tokenExist = await prisma.token.findFirst({
      where: {
        user_id: Number(user_id),
        client_id: Number(client_id),
        app_id: Number(app_id),
      },
    });

    if (!tokenExist)
      return res
        .status(404)
        .json(new Response(404, null, "there is no token exist"));
    // ============================================
    // call rback api for getting role then use that here
    // call 8003 /role/:userId
    // then add role field in token
    // const roleResponse = await fetch(`http://localhost:8003/role/${user_id}`);
    // const { data: userRole } = await roleResponse.json();

    // const access_token = jwt.sign(
    //   { user_id, client_id, app_id, role: userRole?.name || "guest" },
    //   appExist.secret,
    //   { expiresIn: "1d" }
    // );

    // ============================================
    let roleResponse;
    try {
      roleResponse = await fetch(
        `${rbac_url}/api/AaaS/rbac/user/v1/role/${user_id}`
      );
      if (!roleResponse.ok){
        let error = await roleResponse.json()
        return res
          .status(error.statusCode)
          .json(new Response(error.statusCode, null, "RBAC service error " + error.message));
      }
    } catch (err) {
      return res
        .status(500)
        .json(new Response(500, null, "Serverside error " + err));
    }
    const roleData = await roleResponse.json();
    if (!roleData)
      return res
        .status(503)
        .json(new Response(503, null, "Rbac service not work"));

    const userRole = roleData?.data;
    const { access_token, refresh_token } = generateTokens(
      { user_id, client_id, app_id, role: userRole?.name || "Guest" },
      appExist.secret
    );

    await prisma.token.update({
      where: {
        id: tokenExist.id,
      },
      data: {
        user_id: Number(user_id),
        client_id: Number(client_id),
        app_id: Number(app_id),
        access_token,
        refresh_token,
      },
    });

    return res
      .status(200)
      .json(
        new Response(
          200,
          { access_token, refresh_token },
          "token updated successfully"
        )
      );
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Internal server error updating token " + err));
  }
};

// ============ update client token =============
// pass refresh token and add data in head
exports.putUpdateTokenForClient = async (req, res, next) => {
  try {
    const { client_id } = req.head;
    const clientExist = await checkClient(client_id, res);

    if (!clientExist) return;
    const tokenExist = await prisma.client_token.findFirst({
      where: {
        client_id: Number(client_id),
      },
    });

    if (!tokenExist)
      return res
        .status(404)
        .json(new Response(404, null, "there is no token exist"));
    const { access_token, refresh_token } = generateTokens(
      { client_id },
      JWT_CLIENT_SECRET
    );

    await prisma.client_token.update({
      where: {
        id: tokenExist.id,
      },
      data: {
        client_id: Number(client_id),
        access_token,
        refresh_token,
      },
    });

    return res
      .status(200)
      .json(
        new Response(
          200,
          { access_token, refresh_token },
          "token updated successfully"
        )
      );
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Internal server error updating token " + err));
  }
};
// ============= remove or delete token==============

// ============  by client ===================
exports.deleteTokenByClient = async (req, res, next) => {
  try {
    const token_id = req.params.tokenId;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(400)
        .json(new Response(400, null, "Bad request,Invalid token"));

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(400).json(new Response(400, null, "broken request"));

    const tokenExist = await prisma.token.findFirst({
      where: {
        id: Number(token_id),
      },
    });
    if (!tokenExist)
      return res.status(404).json(new Response(404, null, "token not exist"));

    await prisma.token.delete({
      where: {
        id: tokenExist.id,
      },
    });
    return res.status(200).json(new Response(200, null, "token deleted"));
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Internal server error removing token " + err));
  }
};

// ================== by user ==================
exports.deleteTokenByUser = async (req, res, next) => {
  try {
    const { user_id } = req.head;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(400)
        .json(new Response(400, null, "Bad request,Invalid token"));
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(400).json(new Response(400, null, "broken request"));
    const query = `
    select * FROM user_schema.user_blacklist ub
    WHERE ub.user_id=$1;`;

    const result = await pool.query(query, [user_id]);

    if (result.rows.length !== 0)
      return res
        .status(403)
        .json(new Response(403, null, "user is blacklisted by admin"));
    const tokenExist = await prisma.token.findFirst({
      where: {
        access_token: token,
      },
    });
    if (!tokenExist)
      return res.status(404).json(new Response(404, null, "token not exist"));
    await prisma.token.delete({
      where: {
        id: tokenExist.id,
      },
    });
    return res.status(200).json(new Response(200, null, "token deleted"));
  } catch (err) {
    // console.log(err);

    return res
      .status(500)
      .json(new Response(500, null, "Internal server error removing tokens " + err));
  }
};

// ============= delete token for client =================

exports.deleteTokenForClient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res
        .status(400)
        .json(new Response(400, null, "Bad request,Invalid token"));
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(400).json(new Response(400, null, "broken request"));

    const tokenExist = await prisma.client_token.findFirst({
      where: {
        access_token: token,
      },
    });
    if (!tokenExist)
      return res.status(404).json(new Response(404, null, "token not exist"));
    await prisma.client_token.delete({
      where: {
        id: tokenExist.id,
      },
    });
    return res.status(200).json(new Response(200, null, "token deleted"));
  } catch (err) {
    // console.log(err);
    return res
      .status(500)
      .json(new Response(500, null, "Internal server error removing token "+err));
  }
};

/**
 * genrate jwt tokens
 * @param  payload data we need to add in token
 * @param  secret secret for encrpt data
 * @returns access and refresh token
 */
function generateTokens(payload, secret) {
  return {
    access_token: jwt.sign(payload, secret, { expiresIn: "1d" }),
    refresh_token: jwt.sign(payload, secret, { expiresIn: "7d" }),
  };
}

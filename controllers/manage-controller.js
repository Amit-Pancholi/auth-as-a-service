const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwt = require("jsonwebtoken");
const pool = require("../utils/db-connection");
const Response = require("../utils/response-handler");
const { findInTableById } = require("../utils/db-query");
// console.log(Object.keys(prisma));
// =========Crete Token============

// need to pass user_id client_id app_id
exports.postGenerateToken = async (req, res, next) => {
  const { client_id, user_id, app_id } = req.body;

  if (!client_id || !user_id || !app_id)
    return res.status(400).json(new Response(400, null, "All field required"));

  // check user after creating user service

  const clientExist = await findInTableById(
    "Client",
    "client_schema",
    client_id
  );
  if (!clientExist)
    return res.status(404).json(new Response(404, null, "Client not found"));
  const appExist = await findInTableById("App", "client_schema", app_id);
  if (!clientExist)
    return res.status(404).json(new Response(404, null, "App not found"));

  const tokenExist = await prisma.token.findFirst({
    where: {
      user_id: Number(user_id),
      client_id: Number(client_id),
      app_id: Number(app_id),
    },
  });
  console.log(tokenExist);
  if (tokenExist)
    return res.status(403).json(
      new Response(
        403,
        {
          access_token: tokenExist.access_token,
          refresh_token: tokenExist.refresh_token,
        },
        "token already created"
      )
    );
  const access_token = jwt.sign(
    { user_id: user_id, client_id: client_id, app_id: app_id },
    appExist.secret,
    { expiresIn: "1d" }
  );
  const refresh_token = jwt.sign(
    { user_id: user_id, client_id: client_id, app_id: app_id },
    appExist.secret,
    { expiresIn: "7d" }
  );

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
};
// ========= get token ================
exports.getToken = async (req, res, next) => {
  try {
    console.log("start");
    const query = `SELECT t.id,t.access_token,t.refresh_token,c.first_name,c.last_name,c.email,a.app_name 
    FROM token_schema.token t 
    JOIN client_schema."Client" c ON t.client_id=c.id 
    JOIN client_schema."App" a ON t.app_id=a.id;`;
    // need to user join table

    const result = await pool.query(query);
    if (result.rows.length === 0)
      return res.status(204).json(new Response(204, null, "empty table"));
    return res
      .status(200)
      .json(new Response(200, result.rows, "searched data"));
  } catch (err) {
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};
// ======== get token filter ==========
// =========== filter by client id======
exports.getTokenByClient = async (req, res, next) => {
  try {
    const client_id = req.params.id;
    const clientExist = await findInTableById(
      "Client",
      "client_schema",
      client_id
    );

    if (!clientExist)
      return res.status(400).json(new Response(400, null, "Invalid ID"));
    const query = `SELECT t.id,t.access_token,t.refresh_token,c.first_name,c.last_name,c.email,a.app_name 
    FROM token_schema.token t 
    JOIN client_schema."Client" c ON t.client_id=c.id 
    JOIN client_schema."App" a ON t.app_id=a.id
    WHERE c.id=${client_id};`;
    // add user in join
    const result = await pool.query(query);
    if (result.rows.length === 0)
      return res.status(204).json(new Response(204, null, "empty table"));
    return res
      .status(200)
      .json(new Response(200, result.rows, "filtered data"));
  } catch (err) {
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};

// ===========fileter by app id ==============
// provide client_id
exports.getTokenByapp = async (req, res, next) => {
  try {
    const { client_id } = req.body;
    const clientExist = await findInTableById(
      "Client",
      "client_schema",
      client_id
    );

    if (!clientExist)
      return res.status(400).json(new Response(400, null, "bad request"));

    const app_id = req.params.id;
    const appExist = await findInTableById("App", "client_schema", app_id);

    if (!appExist)
      return res.status(400).json(new Response(400, null, "Invalid ID"));
    const query = `SELECT t.id,t.access_token,t.refresh_token,c.first_name,c.last_name,c.email,a.app_name 
    FROM token_schema.token t 
    JOIN client_schema."Client" c ON t.client_id=c.id 
    JOIN client_schema."App" a ON t.app_id=a.id
    WHERE a.id=${app_id}
    WHERE c.id=${client_id};`;
    // add user in join

    const result = await pool.query(query);
    if (result.rows.length === 0)
      return res.status(204).json(new Response(204, null, "empty table"));
    return res
      .status(200)
      .json(new Response(200, result.rows, "filtered data"));
  } catch (err) {
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};

// ============= filter by user id ==============
exports.getTokenByUser = async (req, res, next) => {
  // do  it leater
};

// ============= update token================
// pass refresh token through url and middleware add data(id's) in head
exports.putUpdateToken = async (req, res, next) => {
  try {
    const { client_id, user_id, app_id } = req.head;
    const clientExist = await findInTableById(
      "Client",
      "client_schema",
      client_id
    );
    if (!clientExist)
      return res.status(400).json(new Response(400, null, "Invalid client"));
    const appExist = await findInTableById("App", "client_schema", app_id);

    if (!appExist)
      return res.status(400).json(new Response(400, null, "Invalid app"));

    // add user check later

    const access_token = jwt.sign(
      { user_id: user_id, client_id: client_id, app_id: app_id },
      appExist.secret,
      { expiresIn: "1d" }
    );
    const refresh_token = jwt.sign(
      { user_id: user_id, client_id: client_id, app_id: app_id },
      appExist.secret,
      { expiresIn: "7d" }
    );

    await prisma.token.update({
      where: {
        user_id: Number(user_id),
        client_id: Number(client_id),
        app_id: Number(app_id),
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
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};
// ============= remove or delete token==============

// ============  by client ===================
exports.deleteTokenByClient = async (req, res, next) => {
  try {
    const token = req.params.token;
    if (!token)
      return res.status(400).json(new Response(400, null, "broken request"));

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
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};

// ================== by user ==================
exports.deleteTokenByUser = async (req, res, next) => {
  try {
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
    return res.status(500).json({ Message: "Something went wrong", err });
  }
};

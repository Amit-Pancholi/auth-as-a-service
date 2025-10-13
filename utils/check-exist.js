const Response = require("./response-handler");
const { findInTableById } = require("./db-query");

// return if function result is empty
// example if (!clientExist || !appExist || !userExist) return;

/**
 * Check if a client exists and is active
 */
async function checkClient(client_id, res) {
  const clientExist = await findInTableById(
    "Client",
    "client_schema",
    client_id
  );
  if (!clientExist || clientExist.active === false) {
    res
      .status(404)
      .json(new Response(404, null, "Client not found or removed"));
    return null;
  }
  return clientExist;
}

/**
 * Check if an app exists and is active
 */
async function checkApp(app_id, res) {
  const appExist = await findInTableById("App", "client_schema", app_id);
  if (!appExist || appExist.active === false) {
    res.status(404).json(new Response(404, null, "App not found or removed"));
    return null;
  }
  return appExist;
}

/**
 * Check if a user exists and is active
 */
async function checkUser(user_id, res) {
  const userExist = await findInTableById("user", "user_schema", user_id);
  if (!userExist || userExist.active === false) {
    res.status(404).json(new Response(404, null, "User not found or removed"));
    return null;
  }
  return userExist;
}

module.exports = { checkClient, checkApp, checkUser };

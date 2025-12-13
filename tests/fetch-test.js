const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// 🔹 Replace this with your real app secret
const APP_SECRET = "my_test_secret_key";

// 🔹 Route to test fetch + token generation
app.get("/test-token/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const client_id = 10; // mock client_id
    const app_id = 5; // mock app_id

    // 🧩 Native fetch available in Node v24 — no need for node-fetch
    const roleResponse = await fetch(
      `http://rbac-service:8003/api/AaaS/rbac/user/v1/role/${user_id}`
    );
    const roleData = await roleResponse.json();
    console.log(roleData)
    const userRole = roleData?.data;
    console.log(userRole);
    // 🧩 Generate JWT
    const access_token = jwt.sign(
      { user_id, client_id, app_id, role: userRole?.name || "guest" },
      APP_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token: access_token,
      decoded: jwt.decode(access_token),
      role: userRole,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Start local test server
const PORT = 8080;
app.listen(PORT, () =>
  console.log(`🚀 Test server running on http://localhost:${PORT}`)
);

const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role-manage-controller");
const verifyClient = require('../middlewares/client-auth')
// ======================== ROLE ROUTES ======================== //

// Create a new role
// POST /api/role
router.post("/create/:id", verifyClient, roleController.postCreateRole);

// Update a role
// PUT /api/role/:roleId
router.put("/update/:roleId", verifyClient, roleController.putUpdateRole);

// Delete (soft delete) a role
// DELETE /api/role/:roleId
router.delete("/delete/:roleId", verifyClient, roleController.deleteRole);

// Get all roles for a specific client
// GET /api/role/all
router.get("/all", verifyClient, roleController.getAllRole);

module.exports = router;

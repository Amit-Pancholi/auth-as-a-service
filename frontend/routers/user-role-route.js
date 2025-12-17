const express = require("express");
const userRoleController = require("../controllers/user-role-controller");
const router = express.Router();

router.get("/users", userRoleController.getUsers);
router.post("/Users/ban", userRoleController.postBanUser);
router.get("/Users/banned", userRoleController.getBannedUsers);
router.post("/Users/unban", userRoleController.postUnbanUser);
router.get("/roles", userRoleController.getRoles);
router.post("/Roles/create", userRoleController.postCreateRole);
router.post("/Roles/created", userRoleController.postCreatedRole);
router.post("/Roles/update-page", userRoleController.postUpdateRolePage);
router.post("/Roles/update", userRoleController.postUpdatedRole);
router.post("/Roles/remove", userRoleController.postRemoveRole);
router.post("/Roles/get-by-app", userRoleController.postGetRolesByApp);
router.post("/Roles/assign", userRoleController.postAssignRole);
router.get("/Roles/assign", userRoleController.getAssignRolePage);
router.post("/Roles/assigned/remove", userRoleController.postRemoveAssignedRoles);
router.post(
  "/Roles/assigned/update",
  userRoleController.postUpdateAssignedRoles
);

module.exports = router;
const express = require("express");
const dashboardController = require("../controllers/dashboard-controller");

const router = express.Router();
router.get("/", dashboardController.getDashboard);
router.get("/apps", dashboardController.getApps);
router.post("/apps/url-token", dashboardController.getUrlToken);
router.post("/apps/add", dashboardController.postAddApp);
router.get("/Apps/create", dashboardController.getCreateApp);
router.post("/apps/update/", dashboardController.postUpdateApp);
router.post("/apps/update/:appId", dashboardController.putUpdateApp);
router.post("/apps/delete/:appId", dashboardController.postDeleteApp);

router.get("/tokens", dashboardController.getTokens);
router.get("/settings", dashboardController.getSettings);
router.post("/Settings/update",dashboardController.postUpdateSetting);
router.post("/Tokens/force-logout",dashboardController.postForceLogout);
// router.get("/dashboard/banned-users", dashboardController.getBannedUsers);
// router.get("/dashboard/assign-role", dashboardController.getAssignRole);
// router.get(
//   "/dashboard/update-secret/:appId",
//   dashboardController.getUpdateSecret
// );

module.exports = router;

# Route Fix Checklist

Use this checklist to verify each route after fixing the services. Check an item only after the route behavior, validation, authorization, and response have been tested.

> Route prefixes mounted by each service are not included here because they are defined outside the route files. The paths below are the paths registered inside each router.

## client-service

### `routers/auith-routes.js`

- [ ] `POST /signUp` -> `client-controller.postSignUp`
- [ ] `POST /login` -> `client-controller.postLogin`
- [ ] `GET /myself` -> `jwt-decoder` -> `client-controller.getMyself`
- [ ] `POST /update/myself` -> `jwt-decoder` -> `client-controller.postUpdateMyself`
- [ ] `POST /logOut` -> `jwt-decoder` -> `client-controller.postLogOut`

### `routers/manage-routes.js`

- [ ] `POST /getUrlAndToken` -> `jwt-decoder` -> `manage-controller.getUrlAndToken`
- [ ] `GET /user/all` -> `jwt-decoder` -> `manage-controller.getAllUser`
- [ ] `POST /user/ban` -> `jwt-decoder` -> `manage-controller.banUser`
- [ ] `POST /user/unban` -> `jwt-decoder` -> `manage-controller.unbanUser`
- [ ] `GET /user/banned` -> `jwt-decoder` -> `manage-controller.getBannedUser`
- [ ] `GET /user/active` -> `jwt-decoder` -> `manage-controller.getActiveUser`
- [ ] `GET /user/inactive` -> `jwt-decoder` -> `manage-controller.getInactiveUser`
- [ ] `POST /app/secret` -> `jwt-decoder` -> `manage-controller.postAddAndUpdateSecret`
- [ ] `POST /app/get-secret` -> `jwt-decoder` -> `manage-controller.getSecret`
- [ ] `POST /role/create` -> `jwt-decoder` -> `manage-controller.postCreateRole`
- [ ] `PUT /role/update` -> `jwt-decoder` -> `manage-controller.putUpdateRole`
- [ ] `DELETE /role/delete` -> `jwt-decoder` -> `manage-controller.deleteRole`
- [ ] `GET /role/all` -> `jwt-decoder` -> `manage-controller.getRoles`
- [ ] `POST /role/app` -> `jwt-decoder` -> `manage-controller.getRolesByAppId`
- [ ] `POST /role/assign` -> `jwt-decoder` -> `manage-controller.postAssinRole`
- [ ] `PUT /role/assign/update` -> `jwt-decoder` -> `manage-controller.putUpdateAssinRole`
- [ ] `POST /role/assign/delete` -> `jwt-decoder` -> `manage-controller.deleteAssinRole`
- [ ] `GET /role/assign/all` -> `jwt-decoder` -> `manage-controller.getAlluserWithAssinRole`
- [ ] `POST /role/assign/app` -> `jwt-decoder` -> `manage-controller.getAlluserWithAssinRoleByAppId`
- [ ] `GET /token/user` -> `jwt-decoder` -> `manage-controller.getUserWithToken`
- [ ] `POST /token/app` -> `jwt-decoder` -> `manage-controller.getUserWithTokenByApp`
- [ ] `POST /token/user/remove` -> `jwt-decoder` -> `manage-controller.postRemoveUserToken`
- [ ] `POST /add` -> `jwt-decoder` -> `manage-controller.postAddApps`
- [ ] `PUT /update/:appId` -> `jwt-decoder` -> `manage-controller.putUpdateApps`
- [ ] `GET /all` -> `jwt-decoder` -> `manage-controller.getApp`
- [ ] `GET /:appId` -> `jwt-decoder` -> `manage-controller.getAppById`
- [ ] `DELETE /:appId` -> `jwt-decoder` -> `manage-controller.deleteApp`

## rbac-service

### `routers/role-manage-routes.js`

- [ ] `POST /create/:id` -> `client-auth` -> `role-manage-controller.postCreateRole`
- [ ] `PUT /update/:roleId` -> `client-auth` -> `role-manage-controller.putUpdateRole`
- [ ] `DELETE /delete/:roleId` -> `client-auth` -> `role-manage-controller.deleteRole`
- [ ] `GET /all` -> `client-auth` -> `role-manage-controller.getAllRole`
- [ ] `GET /app/:appId` -> `client-auth` -> `role-manage-controller.getAllRoleByAppId`

### `routers/user-role-routes.js`

- [ ] `POST /add/:roleId` -> `client-auth` -> `user-role-controller.postAddRoleToUser`
- [ ] `PUT /update/:roleId` -> `client-auth` -> `user-role-controller.postUpdateRole`
- [ ] `DELETE /remove/:URId` -> `client-auth` -> `user-role-controller.deleteRoleFromUser`
- [ ] `GET /all` -> `client-auth` -> `user-role-controller.getAllRoledUser`
- [ ] `GET /app/:appId` -> `client-auth` -> `user-role-controller.getAllRoledUsersByApp`
- [ ] `GET /role/:userId` -> `user-role-controller.getSingleUserRole` (internal service route; no middleware)

## token-service

### `routers/manage-router.js`

- [ ] `POST /user` -> `manage-controller.postGenerateTokenForUser`
- [ ] `POST /client` -> `manage-controller.postGenerateTokenForClient`
- [ ] `GET /client/:clientId` -> `client-auth` -> `manage-controller.getTokenForClient`
- [ ] `GET /user` -> `client-auth` -> `manage-controller.getAllUserToken`
- [ ] `GET /app/:appId` -> `client-auth` -> `manage-controller.getTokenByapp`
- [ ] `PUT /user` -> `user-auth` -> `manage-controller.putUpdateTokenForUser`
- [ ] `PUT /client` -> `client-auth` -> `manage-controller.putUpdateTokenForClient`
- [ ] `DELETE /by-user` -> `user-auth` -> `manage-controller.deleteTokenByUser`
- [ ] `DELETE /by-client/:tokenId` -> `client-auth` -> `manage-controller.deleteTokenByClient`
- [ ] `DELETE /client` -> `client-auth` -> `manage-controller.deleteTokenForClient`

## user-service

### `routers/auth-route.js`

- [ ] `POST /signup/:token` -> `user-access` -> `auth-controller.postSignUp`
- [ ] `POST /login/:token` -> `user-access` -> `auth-controller.postLogin`
- [ ] `POST /logout` -> `user-update` -> `auth-controller.postLogOut`

### `routers/manage-route.js`

- [ ] `POST /update/:token` -> `user-update` -> `manage-controller.postUpdateUser`
- [ ] `POST /delete/:token` -> `user-update` -> `manage-controller.postDeleteUser`
- [ ] `POST /ban` -> `jwt-decoder` -> `manage-controller.postBanUser`
- [ ] `POST /unban` -> `jwt-decoder` -> `manage-controller.removeUserFromBlacklist`
- [ ] `GET /all` -> `jwt-decoder` -> `manage-controller.getAllUser`
- [ ] `GET /active` -> `jwt-decoder` -> `manage-controller.getActiveUser`
- [ ] `GET /inactive` -> `jwt-decoder` -> `manage-controller.getInactiveUser`
- [ ] `GET /banned` -> `jwt-decoder` -> `manage-controller.getBanUser`

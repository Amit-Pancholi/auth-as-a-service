const express = require('express')
const manager = require('../controllers/manage-controller')

const tokenRout = express.Router()

tokenRout.post('/token/generate',manager.postGenerateToken)
tokenRout.get('/token',manager.getToken)
tokenRout.get("/token/client/:id", manager.getTokenByClient);
tokenRout.get("/token/app/:id", manager.getTokenByapp);
// provide refresh token
tokenRout.put("/token", manager.putUpdateToken);
// provide access token
tokenRout.delete('/token/:token',manager.deleteTokenByClient)
module.exports = tokenRout
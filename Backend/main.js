const express = require("express");
const config = require('config');

const userRepo = require("./UserRepository.js");

const userAPI_v1 = require("./UserAPI.v1");

var app = express();

var port = config.get("server.APIPort");

userRepo.initUserPool(config);

userAPI_v1.initUserRequests(userRepo, app);


app.listen(port, ()=>{
    console.log("API started on port ", port);
});
var {Pool, Client} = require("pg");
var crypto = require("crypto");
const { resolve } = require("path");




function createClient(config){
    let client = new Client({
        user: config.get("server.DBSettings.user"),
        host: config.get("server.DBSettings.host"),
        database: config.get("server.DBSettings.database"),
        password: config.get("server.DBSettings.password"),
        port: config.get("server.DBSettings.port")
    });

    return client;
}

function createPool(config){
    let pool = new Pool({
        user:config.get("server.DBSettings.user"),
        host:config.get("server.DBSettings.host"),
        database:config.get("server.DBSettings.database"),
        password:config.get("server.DBSettings.password"),
        idleTimeoutMillis: config.get('server.DBSettings.idleTimeout'),
        connectionTimeoutMillis: config.get('server.DBSettings.connectionTimeout')
    });
    return pool;
}

var pool = null;

function initUserPool(config){
    pool = createPool(config);
}

async function getUsers(){
    let query = `SELECT * FROM public."Users";`;
    return new Promise((resolve, reject)=>{
        return pool.connect().then(conn =>{
            conn.query(query)
            .then(result =>{
                resolve(result);
            })
            .catch(error =>{
                conn.release();
                reject(error);
            });
        });
    });
}

async function createUser(email, username, password, pepper){
    let query = `
    INSERT INTO public."Users"("Username", "PasswordHash", "Email", "DateCreated", "LastUpdated")
    VALUES($1, $2, $3, $4, $4);
    `;

    let now = new Date();

    let hash = hashPassword(password, now.toString(), pepper);

    return new Promise((resolve, reject)=>{
        return pool.connect().then(conn=>{
            conn.query(query, [username, hash, email, now])
            .then(result=>{
                resolve(result);
            })
            .catch(error=>{
                conn.release();
                reject(error);
            });
        });
    });
}

async function getUser(username){
    let query = `SELECT u."UserId", u."Username", u."PasswordHash", u."Email", u."Active", u."DateCreated", u."LastUpdated" FROM public."Users" as "u" WHERE u."Username" = $1;`

    return new Promise((resolve, reject)=>{
        return pool.connect().then(conn =>{
            conn.query(query, [username])
            .then(result=>{
                resolve(result);
            })
            .catch(error=>{
                conn.release();
                reject(error);
            });
        });
    });
}

async function updateUserPassword(username, newPassword, salt, pepper){
    var query = `
    UPDATE public."Users"
    SET "PasswordHash" = $1, "LastUpdated"= $2
    WHERE "Username" = $3;
    `;

    let hash = hashPassword(newPassword, salt, pepper);

    let now = new Date();


    return new Promise((resolve, reject)=>{
        return pool.connect().then(conn =>{
            conn.query(query, [hash, now, username])
            .then(result=>{
                resolve(result);
            })
            .catch(error=>{
                conn.release();
                reject(error);
            });
        });
    });
}

function hashPassword(password, salt, pepper){
    return crypto.createHash("sha256").update(salt+password+pepper).digest("hex");
    
}
exports.initUserPool = initUserPool;

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.updateUserPassword = updateUserPassword;
exports.createUser = createUser;
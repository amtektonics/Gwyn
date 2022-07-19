var userRepo = null;
var app = null;
var urlPrefix = "/api/v1/";

function initUserRequests(UserRepository, application){
    userRepo = UserRepository;
    app = application;

    app.get(urlPrefix + "getUsers", (req, res)=>{getUsers(req, res);});
    app.get(urlPrefix + "getUser", (req, res)=>{getUser(req, res);});
}


//GET
function getUsers(req, res){
    userRepo.getUsers().then(
        result=>{
            if(result != undefined){
                if(result.rows.length > 0){
                    res.send(JSON.stringify(result.rows));
                }else{
                    res.send(JSON.stringify([]));
                }
            }else{
                console.log(result);
                res.send(400);
            }
        },  
        error=>{
            console.error(error);
            res.status(500);
        });
}

//GET
function getUser(req, res){
    let username = req.query.username;
    if(username != undefined){
        userRepo.getUser(username).then(
            result=>{
                res.send(JSON.stringify(result.rows));
            }, 
            error=>{
                console.log(error);
                res.status(500);
            });
    }else{
        res.status(400);
    }

}




exports.initUserRequests = initUserRequests;
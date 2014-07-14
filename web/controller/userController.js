var helper = require('./helper');
var userDao = require('../../dao/userDao');
var sha1 = require('sha1');

this.register = function (req, res) {
    req.data = {}; 
    req.data.banner = true;
    req.data.messages= [];
    
    if (req.method == "POST") {
        helper.getPost(req, registerUser);        
    }    
    if (req.method == "GET") {
        finish();
    }
    
    function registerUser(post) {
        req.post = post;
        userDao.select({name : post.name}, checkData);
    }
    
    function checkData (result) {
        var post = req.post;
        var valid = true;
        if (result.length > 0) {
            req.data.messages.push({message : "Error : username already taken."});
            valid = false;
        }
        if (!(post.name.match("^[a-zA-Z0-9]{4,15}$"))) {
            req.data.messages.push({message : "Error : username must only contains letters and numbers and must have between 4 and 15 characters."});
            valid = false;
        }
        if (!(post.password.match("^[a-zA-Z0-9]{4,15}$"))) {
            req.data.messages.push({message : "Error : password must only contains letters and numbers and must have between 4 and 15 characters."});
            valid = false;
        }
        if (!(post.character.match("^[a-z]*$"))) {
            req.data.messages.push({message : "Error : invalid character."});
            valid = false;
        }
        if (post.password != post.passwordconfirm) {
            req.data.messages.push({message : "Error : password and password confirmation doesn't match."});
            valid = false;
        }
        
        if (valid) {
            
            var money = 50;
            switch (post.difficulty) {
                case "easy":
                    money = 3550;
                    break;
                case "normal":
                    money = 550;
                    break;
                case "difficult":
                    money = 150;
                    break;
            }
            var data = {
               password : post.password,
               name : post.name,
               character : post.character,
               money : money,//argent de base
               experience : 0//on commence avec 0 points d'expérience
             };
             userDao.register(
                 data,
                 function (user) {
                     req.session.user_id = user.user_id;
                     var genMap = require("../../world/generateMap");
                     genMap.newPlayer(user, function () {
                         res.writeHead(302, {
                             'Location': '/index/index'
                         });
                         res.end();
                     });
                 }
             );
        } else {
            finish();
        }
        
    }
    
    function finish () {
        helper.render(req.data, {controller : "user", action: "register"}, res);
    };
};

this.login = function (req, res) {
    req.data = {}; 
    req.data.title = "Login";
    req.data.banner = true;
    req.data.messages= [];
    
    if (req.method == "POST") {
        helper.getPost(req, connectUser);        
    }    
    if (req.method == "GET") {
        var get = helper.getGet(req);
        if (get.from_logout) {
            req.data.messages.push({message : "You logged out."});
        }
        finish();
    }
    
    function connectUser(post) {
        req.post = post;
        //Check data
        if (post.password != undefined && post.name != undefined) {
            var data = {
                password : post.password,
                name : post.name,
            };
            userDao.isValid(
                data,
                function (user) {
                    if (user != undefined) {
                        if (post.cookie) {
                            var token = sha1(Math.random());
                            userDao.update({token : token}, {user_id : user.user_id}, function () {
                                
                            });
                            res.setHeader("Set-Cookie", ["username=" + user.name + "; Path=/; Max-Age=31536000;", "token=" + token + "; Path=/; Max-Age=31536000;"]);
                        }
                        req.session.user_id = user.user_id;
                        res.writeHead(302, {
                            'Location': '/index/index/?from_login=true'
                        });
                        res.end();
                    }else {
                        req.data.messages.push({message : "Error : Wrong username/password."});
                        finish();
                    }
                }
            );
        } else {
            finish();
        }
    }
    function finish () {
        helper.render(req.data, {controller : "user", action: "login"}, res);
    };
};


this.logout = function (req, res) {
    req.session.user_id = undefined;
    res.setHeader("Set-Cookie", ["username=invalid; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;", "token=invalid; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"]);
    res.writeHead(302, {
        'Location': '/user/login/?from_logout=true'
    });
    res.end();
};
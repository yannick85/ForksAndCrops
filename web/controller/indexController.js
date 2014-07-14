var userDao = require('../../dao/userDao');
var squareDao = require('../../dao/squareDao');
var helper = require('./helper');
var staticRessource = require("../../world/static");

this.index = function (req, res) {
    req.data = {}; 
    req.data.banner = false;
    
    helper.checkAuth(req, res, function() {
        console.log(req.session);
        userDao.get(req.session.user_id ,function(result){
            req.data.player = result;
            finish();
        }); 
        squareDao.getBase(req.session.user_id ,function (result) {
            req.data.squares = result;
            finish();
        });
        
        squareDao.getTerritorySize(req.session.user_id ,function (result) {
            req.data.territorySize = result;
            finish();
        });
    });    

    function finish () {
        var data = req.data;
        if (data.player != undefined && data.squares != undefined && data.territorySize != undefined) {
            delete data.player.password;
            delete data.player.token;
            
            data.territorySize = data.territorySize;
            data.level = staticRessource.getLevel(data.player.experience);
            data.experienceToUp = staticRessource.experienceToUp(data.level, data.player.experience);
            
            data.cropList = staticRessource.crops;
            data.cropListStr = JSON.stringify(data.cropList);
            data.player = JSON.stringify(data.player);
            data.squares = JSON.stringify(data.squares);
            helper.render(req.data, {controller : "index", action: "index"}, res);
        }
    };
};


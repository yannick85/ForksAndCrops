var io;
var squareDao = require('../dao/squareDao');
var userDao = require('../dao/userDao');
var userWeaponDao = require('../dao/userWeaponDao');
var staticRessource = require('../world/static');
var world = require('../world/world');

var socketServer = this;

this.init = function (app) {
    io = require('socket.io').listen(app);
    io.set('log level', 1);
    io.on('connection', function(socket){
        console.log('new socket connection :)');
        socket.fc = {};
        socket.fc.isAuth = false;
        
        socket.on('disconnect', function(){
            console.log('a socket died :(');
            if (socket.fc.isAuth && socket.fc.player != undefined) {
                socketServer.globalMessage('infomessage', "Player " + socket.fc.player.name + " disconnected");
            }
        });
        
        socket.on('auth', function(data){
            userDao.get(data.user_id, function (user) {
                if (user != undefined) {
                    socket.fc.player = user;
                    socket.fc.isAuth = true;
                    socket.fc.player.level = staticRessource.getLevel(user.experience);
                    if (socket.fc.player.tutorial) {
                        socket.emit("showtutorial", {});
                        userDao.update({ tutorial: false }, {user_id : socket.fc.player.user_id}, function(result){  });
                    }
                    squareDao.getSquaresFromCenter(socket.fc.player.x, socket.fc.player.y, function(result){
                        socket.emit("squares", result);
                    });
                    socket.checkNeighbours();
                    socketServer.globalMessage('infomessage', "Player " + socket.fc.player.name + " connected");
                };
            });
        });

        socket.checkAuth = function () {
            if (socket.fc.isAuth && socket.fc.player) {
                return true;
            } else {
                socket.emit('needauth', {});
                return false;
            };
        };
        
        socket.on('move', function (data) {
            if (socket.checkAuth()) {
                squareDao.getSquaresFromCenter(data.x, data.y, function(result){
                    if (result && socket.checkAuth()) {
                        socket.emit("squares", result);
                        var squareExist = false;
                        for (var id in result) {
                            if (result[id].x == data.x && result[id].y == data.y) {
                                squareExist = true;
                            }
                        }
                        if (squareExist) {
                            socket.fc.player.x = data.x;
                            socket.fc.player.y = data.y;
                            socket.updatePlayer();
                            socket.emit("move", data);
                            socket.checkNeighbours();
                        } else {
                            socket.emit("infomessage", "You cannot move here");
                            socket.emit("cannotmove", {});
                        }
                    };
                });
            };
        });
        
        socket.on('squares', function (data) {
            if (socket.checkAuth()) {
                squareDao.getSquaresFromCenter(socket.fc.player.x, socket.fc.player.y, function(result){
                    socket.emit("squares", result);
                });
            };
        });
        
        socket.on('croplist', function(){
            socket.emit("croplist", staticRessource.crops);
        });
        
        socket.on('market-crop', function(){
            socket.emit("market-crop", staticRessource.cropSellPrice);
        });
        
        socket.on('natural-event-list', function(){
            socket.emit("natural-event-list", world.naturalEvents);
        });
        
        socket.on('weapons', function(){
            socket.sendWeapons();
        });
        
        socket.sendWeapons = function () {
            if (socket.checkAuth()) {
                userWeaponDao.getForUser(socket.fc.player.user_id, function (results) {
                    if (socket.checkAuth()) {
                        var weapons = JSON.parse(JSON.stringify(staticRessource.weapons));
                        for (var id in results) {
                            var result = results[id];
                            weapons[result.weapon_id].owned=true;
                        }
                        weapons[socket.fc.player.weapon_id].current= true;
                        socket.emit("weapons", weapons);
                    }
                });
            };
        };
        
        socket.on('buyweapon', function(weaponId){
            if (socket.checkAuth() && staticRessource.weapons[weaponId]) {
                var weapon = staticRessource.weapons[weaponId];
                if (socket.fc.player.money > weapon.price) {
                    userWeaponDao.insert({user_id : socket.fc.player.user_id, weapon_id: weaponId}, function () {
                        if (socket.checkAuth()) {
                            socket.fc.player.weapon_id = weapon.weapon_id;
                            socket.addMoney((- weapon.price));
                            socket.updatePlayer();
                            socket.emit("infomessage", "You bought and equipped " + weapon.name);
                            socket.sendWeapons();
                        };
                    });
                } else {
                    socket.emit("infomessage", "You are too poor to buy this weapon ! Get some work done !.");
                }
            };
        });
        
        socket.on('equipweapon', function(weaponId){
            if (socket.checkAuth() && staticRessource.weapons[weaponId]) {
                var weapon = staticRessource.weapons[weaponId];
                userWeaponDao.select ({user_id : socket.fc.player.user_id, weapon_id : weaponId},function (results) {
                    if (socket.checkAuth()) {
                        if (results.length > 0) {
                            socket.fc.player.weapon_id = weapon.weapon_id;
                            socket.updatePlayer();
                            socket.emit("infomessage", "You equipped " + weapon.name);
                            socket.sendWeapons();
                            
                        }
                    };
                });
            };
        });
        
        socket.on('playerlist', function(){
            if (socket.checkAuth()) {
                userDao.getAll(function (results) {
                    if (socket.checkAuth()) {
                        var sockets = io.sockets.clients();
                        var connectedPlayers = [];
                        for ( var id in sockets) {
                            var testSocket = sockets[id];
                            if (testSocket.fc.isAuth) {
                                connectedPlayers.push(testSocket.fc.player.user_id);
                            }
                        }
                        
                        var tabFinal = [];
                        for (var id in results) {
                            var result = results[id];
                            var isConnected = false;
                            var i = connectedPlayers.length;
                            while (i > 0 || i == 0) {
                               if (connectedPlayers[i] == result.user_id) {
                                   isConnected = true;
                               };
                               i--;
                            };
                            tabFinal.push({
                                user_id : result.user_id,
                                name : result.name,
                                connected : isConnected,
                                level : staticRessource.getLevel(result.experience),
                                x : result.x,
                                y : result.y,
                            });
                        }
                        
                        socket.emit('playerlist', tabFinal);
                    };
                });
            };
        });
        
        socket.on('setcrop', function(data){
            if (socket.checkAuth() && data.square && data.square.x && data.square.y && staticRessource.crops[data.crop_id]) {
                var crop = staticRessource.crops[data.crop_id];
                var square = data.square;
                var change = {
                        crop_id : data.crop_id,
                        crop_health : 100,//max health point of a crop
                        crop_maturity : 0,
                };
                squareDao.update( change, {x : square.x, y : square.y, owner_id : socket.fc.player.user_id,}, function (result) {
                    if (socket.checkAuth()) {
                        socket.addExperience(staticRessource.experience.setCrop);
                        socket.addMoney((- crop.price));
                        socket.updatePlayer();
                        
                        socket.sendTile(square.x, square.y);
                    };
                } );
            };
        });
        
        socket.on('sellcrop', function(data){
            if (socket.checkAuth() && data.x && data.y) {
                squareDao.select ({x : data.x, y : data.y, owner_id : socket.fc.player.user_id,}, function (result) {
                    if (socket.checkAuth() && result && result[0]) {
                        var square = result[0];
                        if (square.crop_id != null) {
                            var crop = staticRessource.crops[square.crop_id];
                            var cropPrice = staticRessource.cropSellPrice[square.crop_id];
                            var cropMaturity = square.crop_maturity *100 /crop.maturation;
                            if (cropMaturity > 80) {
                                var data = {
                                    crop_id : null,
                                    crop_health : null,
                                    crop_maturity : null,
                                };
                                var where = {
                                    x : square.x, 
                                    y : square.y,
                                    owner_id : socket.fc.player.user_id,
                                };
                                socket.addExperience(staticRessource.experience.harvestCrop);
                                socket.addMoney(Math.round(crop.productivity * cropPrice));
                                socket.updatePlayer();
                                squareDao.update(data, where, function (result) {
                                    if (socket.checkAuth()) {
                                        socket.sendTile(square.x, square.y);
                                        socket.emit("infomessage", "You sold " + crop.productivity + " " + crop.name + " from x:" + square.x + " - y:" + square.y + ", you earned " + (Math.round(crop.productivity * cropPrice)) + " gold.");
                                    };
                                });
                            };
                        } else {
                            socket.emit("infomessage", "No crop on this tile.");
                        };
                    };
                });
            };
        });
        
        socket.on('removecrop', function(data){
            if (socket.checkAuth() && data.x && data.y) {
                var change = {
                    crop_id : null,
                    crop_health : null,
                    crop_maturity : null,
                };
                var where = {
                    x : data.x, 
                    y : data.y,
                    owner_id : socket.fc.player.user_id,
                };
                squareDao.update(change, where, function (result) {
                    if (socket.checkAuth() && result) {
                        socket.sendTile(data.x, data.y);
                        socket.emit("infomessage", "You removed the crop from x:" + data.x  + " - y:" + data.y + ".");
                    };
                });
            };
        });
        
        socket.on('fertilizecrop', function(data){
            if (socket.checkAuth() && data.x && data.y) {
                var fertilizePrice = 4;
                var fertilizeEffect = 30;
                squareDao.select ({x : data.x, y : data.y, owner_id : socket.fc.player.user_id,}, function (result) {
                    var square = result[0];
                    if (socket.fc.player.money > fertilizePrice && (square.fertility + fertilizeEffect) < 100) {
                        var data = {
                            fertility : square.fertility + fertilizeEffect,
                        };
                        var where = {
                            x : square.x, 
                            y : square.y,
                            owner_id : socket.fc.player.user_id,
                        };
                        squareDao.update(data, where, function (result) {
                            if (socket.checkAuth()) {
                                socket.addExperience(staticRessource.experience.fertilize);
                                socket.addMoney((- fertilizePrice));
                                socket.updatePlayer();
                                socket.sendTile(data.x, data.y);
                            };
                        });
                    };
                });
            };
        });
        
        socket.on('watercrop', function(data){
            if (socket.checkAuth() && data.x && data.y) {
                var waterPrice = 4;
                var waterEffect = 30;
                squareDao.select ({x : data.x, y : data.y, owner_id : socket.fc.player.user_id,}, function (result) {
                    var square = result[0];
                    if (socket.fc.player.money > waterPrice && (square.humidity + waterEffect) < 100) {
                        var data = {
                            humidity : square.humidity + waterEffect,
                        };
                        var where = {
                            x : square.x, 
                            y : square.y,
                            owner_id : socket.fc.player.user_id,
                        };
                        squareDao.update(data, where, function (result) {
                            if (socket.checkAuth()) {
                                socket.addExperience(staticRessource.experience.water);
                                socket.addMoney((- waterPrice));
                                socket.updatePlayer();
                                socket.sendTile(data.x, data.y);
                            };
                        });
                    };
                });
            };
        });
        
        socket.on('buytile', function(data){
            if (socket.checkAuth() && data.x && data.y) {
                squareDao.getSquaresFromCenter(data.x, data.y, function(result){
                    if (socket.checkAuth()) {
                        var canBuy = false;
                        var square = null;
                        for (var key in  result) {
                            if (result[key].x == data.x) {
                                if (result[key].y == data.y) {
                                    square = result[key];
                                }
                                if (result[key].owner_id == socket.fc.player.user_id && (result[key].y == (data.y - 1) || result[key].y == (data.y + 1))) {
                                    canBuy = true;
                                }
                            }
                            if (result[key].owner_id == socket.fc.player.user_id && result[key].y == data.y && (result[key].x == (data.x - 1) || result[key].x == (data.x + 1))) {
                                canBuy = true;
                            }
                        }
                        if (canBuy) {
                            if (square != null && square.owner_id == null) {
                               //Calcul prix d'achat
                                var squarePrice = 500;
                                
                                if (socket.fc.player.money > squarePrice) {
                                    squareDao.update({ owner_id : socket.fc.player.user_id }, { x : square.x, y : square.y }, function (result) {
                                        if (socket.checkAuth()) {
                                            socket.addExperience(staticRessource.experience.buyTile);
                                            socket.addMoney((- squarePrice));
                                            socket.updatePlayer();
                                            
                                            square.owner_id = socket.fc.player.user_id;
                                            socket.emit("squares", [ square ] );
                                            socket.emit("infomessage", "You bought the tile in x:" + square.x + ", y:" + square.y + " for " + squarePrice + " gold.");
                                            socket.checkTerritorySize();
                                        };
                                    });
                                } else {
                                    //Too poor !
                                    socket.emit("infomessage", "You don't have enough money to buy this tile.");
                                } 
                            } else {
                                //this square belong to someone
                                socket.emit("infomessage", "This tile belong to someone.");
                            }
                        } else {
                            //Pas voisin
                            socket.emit("infomessage", "You can't buy this tile.");
                        }
                    };
                });
            };
        });
        
        socket.on('attacktile', function(data){
            if (socket.checkAuth() && data.x && data.y) {
                squareDao.getSquaresFromCenter(data.x, data.y, function(result){
                    if (socket.checkAuth()) {
                        var canAttack = false;
                        var square = null;
                        for (var key in  result) {
                            if (result[key].x == data.x) {
                                if (result[key].y == data.y) {
                                    square = result[key];
                                }
                                if (result[key].owner_id == socket.fc.player.user_id && (result[key].y == (data.y - 1) || result[key].y == (data.y + 1))) {
                                    canAttack = true;
                                }
                            }
                            if (result[key].owner_id == socket.fc.player.user_id && result[key].y == data.y && (result[key].x == (data.x - 1) || result[key].x == (data.x + 1))) {
                                canAttack = true;
                            }
                        }
                        if (canAttack) {
                            if (square != null && square.owner_id != null && square.owner_id != socket.fc.player.user_id) {
                               //Calcul prix d'achat
                                var attackPrice = 500;
                                
                                if (socket.fc.player.money > attackPrice) {
                                    socket.addMoney((- attackPrice));
                                    socket.updatePlayer();
                                    userDao.get(square.owner_id, function (defender) {
                                        if (defender) {
                                            var defenderWeapon = staticRessource.weapons[defender.weapon_id];
                                            var defenderLevel = staticRessource.getLevel(defender.experience);
                                            var defenderHealth = staticRessource.getMaxHealth(defenderLevel);//Defender always have max health and don't lose health whatever happen
                                            var attackWeapon = staticRessource.weapons[socket.fc.player.weapon_id];
                                            
                                            var combatStr = "Conquest of the tile x:" + square.x + ", y:" + square.y;
                                            combatStr += "<br />" + socket.fc.player.name + " (Lvl : " + socket.fc.player.level + " - Weapon : " + attackWeapon.name + ")<br />Versus<br />" + defender.name + " (Lvl : " + defenderLevel + " - Weapon : " + defenderWeapon.name + ")";
                                            combatStr += "<br />";
                                            combatStr += "<br />" + socket.fc.player.name + " has " + socket.fc.player.health + " HP.";
                                            combatStr += "<br />" + defender.name + " has " + defenderHealth + " HP.";
                                            
                                            //defender always start
                                            var defenderTurn = true;
                                            while (defenderHealth > 0 && socket.fc.player.health > 0) {
                                                var currentWeapon = null;
                                                var player1 = null;
                                                var player2 = null;
                                                if (defenderTurn) {
                                                    currentWeapon = defenderWeapon;
                                                    player1 = defender;
                                                    player2 = socket.fc.player;
                                                } else {
                                                    currentWeapon = attackWeapon;
                                                    player1 = socket.fc.player;
                                                    player2 = defender;
                                                }
                                                var lostHealth = 0;
                                                combatStr += "<br />";
                                                for (var i = 0; i < currentWeapon.hit_per_second; i++) {
                                                    if (Math.ceil(Math.random()*100) < currentWeapon.hit_ratio) {
                                                        combatStr += "<br />" + player1.name + " touch for " + currentWeapon.power;
                                                        lostHealth += currentWeapon.power;
                                                    } else {
                                                        combatStr += "<br />" + player1.name + " missed";
                                                    };
                                                };
                                                if (defenderTurn) {
                                                    socket.fc.player.health = socket.fc.player.health - lostHealth;
                                                } else {
                                                    defenderHealth = defenderHealth - lostHealth;
                                                }
                                                defenderTurn = !(defenderTurn);
                                            }
                                            
                                            otherSocket = socket.getSocketWithPlayerName(defender.name);
                                            
                                            if (! (socket.fc.player.health > 0) ) {//If lost : 
                                                combatStr += "<br /><br />" + socket.fc.player.name + " fainted<br />" + defender.name + " won!";
                                                socket.fc.player.health = 0;
                                                socket.emit("infomessage", "<div class=\"important\">You lost an attack in x:" + square.x + ", y:" + square.y + " to " + defender.name + ".</div>");
                                                if (otherSocket != false) {
                                                    otherSocket.emit("infomessage", "<div class=\"important\">" + socket.fc.player.name + " attacked you in x:" + square.x + ", y:" + square.y + " and lost.</div>");
                                                }
                                            } else {// if won
                                                combatStr += "<br /><br />" + defender.name + " fainted<br />" + socket.fc.player.name + " won!";
                                                socket.addExperience(staticRessource.experience.conquerTile);
                                                square.owner_id = socket.fc.player.user_id;
                                                socket.emit("squares", [ square ] );
                                                socket.emit("infomessage", "<div class=\"important\">You conquered the tile in x:" + square.x + ", y:" + square.y + ".</div>");
                                                socket.checkTerritorySize();
                                                otherSocket = socket.getSocketWithPlayerName(defender.name);
                                                if (otherSocket != false) {
                                                    otherSocket.emit("infomessage", "<div class=\"important\">You lost the tile in x:" + square.x + ", y:" + square.y + " to " + socket.fc.player.name + ".</div>");
                                                }
                                                squareDao.update({ owner_id : socket.fc.player.user_id }, { x : square.x, y : square.y }, function (result) {
                                                });
                                            }
                                            socket.updatePlayer();
                                            socket.emit("health", socket.fc.player.health);
                                            
                                            socket.emit("popupmessage", {title: "Combat!", message : combatStr});
                                            if (otherSocket != false) {
                                                otherSocket.emit("popupmessage", {title: "Combat!", message : combatStr});
                                            }
                                        }
                                    });
                                } else {
                                    //Too poor !
                                    socket.emit("infomessage", "You don't have enough money to attack this tile.");
                                } 
                            } else {
                                //this square belong to someone
                                socket.emit("infomessage", "This tile doesn't belong to someone or belong to you.");
                            }
                        } else {
                            //Pas voisin
                            socket.emit("infomessage", "You can't attack this tile.");
                        }
                    };
                });
            };
        });
        
        socket.on('chat-send', function(message){
            message = message.replace(/<[^>]*>/, "");//Fuck MrWiwi
            if (socket.checkAuth()) {
                //check if pm
                var pmRegex = '^(/pm) ([a-zA-Z0-9]+) (.+)$';
                var result = message.match(pmRegex);
                if (result) { //Is this a private message ?
                    var recipient = result[2];
                    var privateMessage = result[3];
                    var recipientSocket = socket.getSocketWithPlayerName(recipient);
                    if (recipientSocket != false) {
                        var str = "<span class=\"private-message\">to <span class=\"recipient\" >" + recipient + "</span> : " + privateMessage + "<span>";
                        socket.emit('chat-show', str);
                        var str = "<span class=\"private-message\"><span class=\"sender\" >" + socket.fc.player.name + "</span> : " + privateMessage + "<span>";
                        recipientSocket.emit('chat-show', str);
                        recipientSocket.emit('infomessage', "<div class=\"chatinfo private-message\">" + "Private message from " + socket.fc.player.name + " : " + privateMessage + "</div>");
                    } else {
                        socket.emit('infomessage', "There is no " + recipient + " connected");
                    }
                } else {
                    var str = "<span class=\"public-message\"><span class=\"sender\" >" + socket.fc.player.name + "</span> : " + message + "<span>";
                    socketServer.globalMessage('infomessage', "<div class=\"chatinfo public-message\">" + str + "</div>");
                    socketServer.globalMessage('chat-show', str);
                }
                
            };
        });        
        
        socket.addExperience = function (experienceBonus) {
            socket.fc.player.experience = socket.fc.player.experience + experienceBonus;
            var level = staticRessource.getLevel(socket.fc.player.experience);
            if (level != socket.fc.player.level) {//levelup
                socket.fc.player.level = level;
                socket.emit("level", level);
                var levelupStr = "You are now level " + level + "!";
                socket.emit("popupmessage", {title: "Level Up!", message : levelupStr, confirm : "Great!"});
            }
            socket.emit("experiencetoup", staticRessource.experienceToUp(socket.fc.player.level, socket.fc.player.experience));
            socket.emit("experiencewon", experienceBonus);
        };
        
        socket.addMoney = function (moneyBonus) {
            socket.fc.player.money = socket.fc.player.money + moneyBonus;
            socket.emit("money", socket.fc.player.money);
        };
        
        socket.updatePlayer = function () {
            userDao.update({money : socket.fc.player.money, experience : socket.fc.player.experience, x : socket.fc.player.x, y : socket.fc.player.y, weapon_id : socket.fc.player.weapon_id, health : socket.fc.player.health }, {user_id : socket.fc.player.user_id}, function(result){  });
        };
        
        socket.checkTerritorySize = function() {
            squareDao.getTerritorySize(socket.fc.player.user_id ,function (result) {
                socket.emit("territorysize", result);
            });  
        };
        
        socket.checkNeighbours = function () {
            var radiusCheckNeighbour = 4;//radius on l'on peut voir d'autres joueurs
            var sockets = io.sockets.clients();
            for ( var id in sockets) {
                var testSocket = sockets[id];
                if (testSocket.fc.isAuth && testSocket.fc.player.user_id != socket.fc.player.user_id) {
                    var difX = socket.fc.player.x - testSocket.fc.player.x;
                    var difY = socket.fc.player.y - testSocket.fc.player.y;
                    if (Math.abs(difX) < (radiusCheckNeighbour) && Math.abs(difY) < (radiusCheckNeighbour)) {
                        var otherData = {
                          user_id : testSocket.fc.player.user_id,
                          name : testSocket.fc.player.name,
                          color : testSocket.fc.player.color,
                          character : testSocket.fc.player.character,
                          x : testSocket.fc.player.x,
                          y : testSocket.fc.player.y,
                        };
                        socket.emit("otherplayermoved", otherData);
                    }
                    if (Math.abs(difX) < (radiusCheckNeighbour + 1) && Math.abs(difY) < (radiusCheckNeighbour + 1)) {
                        var myData = {
                            user_id : socket.fc.player.user_id,
                            name : socket.fc.player.name,
                            color : socket.fc.player.color,
                            character : socket.fc.player.character,
                            x : socket.fc.player.x,
                            y : socket.fc.player.y,
                         };
                        testSocket.emit("otherplayermoved", myData);
                    }
                }
            }
        };
        
        socket.sendTile = function (oX,oY) {
            squareDao.select ({x : oX, y : oY}, function (result) {
                if (socket.checkAuth() && result && result[0]) {
                    if (socket.fc.player.user_id == result[0].owner_id) {
                        result[0].owner_name = socket.fc.player.name;
                    }
                    socket.emit("squares", [ result[0] ] );
                };
            });
        };
        
        socket.getSocketWithPlayerName = function (playerName) {
            var sockets = io.sockets.clients();
            for ( var id in sockets) {
                var testSocket = sockets[id];
                if (testSocket.fc.isAuth && testSocket.fc.player.name == playerName) {
                    return testSocket;
                }
            };
            return false;
        };
   });
};

this.globalMessage = function (title, content) {
    io.sockets.emit(title, content);
};

this.getSockets = function () {
    return io.sockets.clients();
};


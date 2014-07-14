/**
 * THIS IS THE WORLD, IT LIVES, PLEASE RESPECT IT
 */
var staticRessource = require("./static");
var squareDao = require('../dao/squareDao');
var userDao = require('../dao/userDao');
var pontifex = require('../socket/socket'); //Le pont entre Dieu et les hommes

this.heartbeatInterval = null;
this.heartbeatIntervalValue = 2000; //en millisecondes
this.heartbeatCount = 0;

this.naturalEvents = [];
this.eventId = 0;

var world = this;

this.init = function() {
    userDao.getNumberOfPlayer(function (result) {
        world.numberOfPlayer = result;
        if (world.heartbeatInterval == null) {
            clearInterval(world.heartbeatInterval);
        }
        world.heartbeatInterval = setInterval(function(){
            world.hearthbeat();
        }, world.heartbeatIntervalValue);
    });
   
};

this.numberOfPlayer = undefined;
this.lastSquares = undefined;

this.isWorking = false;

/**
 * 
 */
this.hearthbeat = function () {
    if ((this.heartbeatCount % 10) == 0) {
        console.log("HB : POUM ! " + this.heartbeatCount);
    }
    
    squareDao.select ({} ,function (squares) {
        world.isWorking = true;
        world.lastSquares = squares;
        for (var id in squares) {
            var square = squares[id];
            /* début agriculture */
            if (square.crop_id != null) {
                var crop = staticRessource.crops[square.crop_id];
                if (square.fertility > 1 && square.humidity > 1) { // can grow
                    square.crop_maturity++;
                    square.fertility = square.fertility - 1;
                    square.humidity = square.humidity - 1;
                } else {
                    square.crop_health = square.crop_health -0.5;
                }
                
                if (square.crop_maturity > crop.maturation) {
                    //Decay
                    square.crop_health = square.crop_health -0.5;
                }
                if (square.crop_health < 0) {//death of the crop
                    square.crop_id = null;
                    square.crop_health = null;
                    square.crop_maturity = null;
                }
            }
            /* fin agriculture */
            if (square.fertility < 70) {
                square.fertility = square.fertility + 0.1;
            }
            if (square.humidity < 70) {
                square.humidity = square.humidity + 0.1;
            }
            
            /* natural effects ! */
            for (var id in world.naturalEvents) {
                var event = world.naturalEvents[id];
                if ((square.x > (event.x - event.radius) && square.x < (event.x + event.radius)) && (square.y > (event.y - event.radius) && square.y < (event.y + event.radius))) {
                    if (event.effect_on_health != undefined) {
                        if (square.crop_health != null) {
                            square.crop_health = square.crop_health + event.effect_on_health;
                        }
                    }
                    if (event.effect_on_humidity != undefined) {
                        square.humidity = square.humidity + event.effect_on_humidity;
                        if (square.humidity > 100) {
                            square.humidity = 100;
                        }
                    }
                }
            }
            /* fin natural effects */
            
        }
        squareDao.updateAll(squares, function (result) {
            world.isWorking = false
        });
    });
    
    
    //regeneration des joueurs
    var sockets = pontifex.getSockets();
    for ( var id in sockets) {
        var socket = sockets[id];
        if (socket.fc.player != undefined) {
            var maxHealth = staticRessource.getMaxHealth(socket.fc.player.level);
            if (socket.fc.player.health != maxHealth) {
                socket.fc.player.health = socket.fc.player.health + 1;
                if (socket.fc.player.health > maxHealth) {
                    socket.fc.player.health = maxHealth;
                }
                socket.updatePlayer();
                socket.emit("health", socket.fc.player.health);
            } 
        }
        
    }
    
    
    /* crop market */
    var variationValue = 1;//variation maximum de prix pour un produit qui se plante a l'unité
    if ((this.heartbeatCount % 5) == 0) {
        for (var i = 0; i < staticRessource.crops.length; i++) {
            crop = staticRessource.crops[i];
            cropPrice = staticRessource.cropSellPrice[i];
            var coef = -1;
            if (this.random(2) == 1) {
                coef = 1;
            }
            cropPrice = cropPrice + (Math.random()*variationValue*coef)/crop.productivity;//Math.random() produit un nombre entre 0.0000 et 1
            staticRessource.cropSellPrice[i] = ((Math.round(cropPrice*100))) / 100.0;//Maximum 2 chiffre après la virgule
        }
    }
    /* fin crop market */
    
    /* Natural Events */
    if ((this.heartbeatCount % 10) == 0) {//tous les 10 HB
        if (this.lastSquares != undefined) {
            if (this.random(Math.round(10/this.numberOfPlayer)) == 1) {//Rain
                var squareId = this.random(this.lastSquares.length) - 1;
                var event = {
                        event_type_id :0,
                        name : "Rain",
                        duration : 25,//in world HB,
                        description : "Water falling from the sky ! Increase humidity.",
                        effect_on_humidity : 1.5,
                        x : this.lastSquares[squareId].x,
                        y : this.lastSquares[squareId].y,
                        radius : 6,
                        event_id : this.eventId,
                };
                this.naturalEvents.push(event);
                pontifex.globalMessage("infomessage", "It's raining in x:" + event.x + ", y:" + event.y + "!");
                this.eventId++;
            }
            if (this.random(Math.round(25/this.numberOfPlayer)) == 1) {//tornado
                var squareId = this.random(this.lastSquares.length) - 1;
                var event = {
                        event_type_id : 1,
                        name : "Tornado",
                        duration : 10,//in world HB
                        description : "A terrible event who damage crops.",
                        x : this.lastSquares[squareId].x,
                        y : this.lastSquares[squareId].y,
                        effect_on_health : -7.5,
                        radius : 3,
                        event_id : this.eventId,
                };
                this.naturalEvents.push(event);
                pontifex.globalMessage("infomessage", "Brace yourself, a tornado is coming in x:" + event.x + ",y:" + event.y + "!");
                this.eventId++;
            }
        }
        
    }
    
    var tabToRemove = [];
    for ( var id in this.naturalEvents ) {
        this.naturalEvents[id].duration  = this.naturalEvents[id].duration - 1;
        if (this.naturalEvents[id].duration == 0) {
            tabToRemove.push(id);
        }
    }
    for (var i in tabToRemove ) {
        var id = tabToRemove[i];
        this.naturalEvents.splice(id, 1);
    }
    /* Fin natural events*/
    
    this.heartbeatCount++;
};

this.random = function (nb) {
    if (nb == undefined) {
        nb = 10;
    }
    return Math.ceil(Math.random()*nb);
};
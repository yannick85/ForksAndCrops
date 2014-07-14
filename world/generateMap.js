var squareDao = require('../dao/squareDao.js');
var userDao = require('../dao/userDao.js');
var userWeaponDao = require('../dao/userWeaponDao.js');
var world = require('./world.js');

/**
 * When a new player join the game
 * some squares are added to the map
 */
this.newPlayer = function (player, callback) {
    //TODO work in progess, ne pas depasser 4 joueurs pour l'instant
    /*
     * (For the moment all zone have same width and height)
     * To decide where the new player zone should be we have to know what the current maxX and maxY of the map are and the number of zones set (count(squares)/(zoneW*zoneH))
     * and if the map is a square (the map is a square if nb_zone = (maxX/zW)*(maxY/zH))
     * if nb_zone == 0 =>  0;0
     * if (maxX == maxY && is square) => maxX;0
     * if maxX > maxY => maxX => 0;maxY
     * if (maxX == maxY && is NOT square) => max-zW;maxY-zH
     */
    squareDao.getCount(function(data){
        /*
         * DO NOT CHANGE THIS VALUES DURING A GAME !
         */
        /* Were to put the zone ? */
        var zoneWidth = 8;//doit etre pair
        var zoneHeight = 8;
        var centerx = Math.floor(zoneWidth/2);
        var centery = Math.floor(zoneHeight/2);
        
        var maxX = data.max_x/zoneWidth;
        var maxY = data.max_y/zoneHeight;
        var nbZone = data.count/(zoneHeight*zoneWidth);
        var isSquare = false;
        var dif = (maxX*maxY) - nbZone;
        if (dif == 0) {
            isSquare = true;
        }
        
        var startX = 0;
        var startY = 0;
        
        if (nbZone > 0) {
            if (maxX == maxY) {
                if (isSquare) {
                    startX = maxX;
                    startY = 0;
                } else {
                    if (dif % 2 == 0) {
                        startX = maxX - 1;
                        startY = maxY - 1 - parseInt(dif/2);
                    } else {
                        startX = maxX - 1 - parseInt(dif/2);
                        startY = maxY - 1;
                    }
                }
            } else {
                if (maxX > maxY) {
                    startX = 0;
                    startY = maxY;
                }
            }
        }
        
        var startx = startX * zoneWidth;
        var starty = startY * zoneWidth;
        
        
        /* generate the map property
         * 
         *  Attention en modifiant certaines des valeurs ci dessus, vous pouvez creer une infinite loop
         *  
         *  */
        var numberOfFertilePoint = 2;
        var fertilityMap = [];
        var humidityMap = [];
        for ( var i = 1; i < (zoneWidth+1); i++) {
            fertilityMap[i] = [];
            humidityMap[i] = [];
            for ( var j = 1; j < (zoneHeight+1); j++) {
                fertilityMap[i][j] = 20;
                humidityMap[i][j] = 40;
            }
        }
        var fertilePoint = 0;
        var radiusFertilePoint = 1;//ecart minimum entre chaque fertilePoint, le fertilepoint aura de l'effet au double du radius
        while (fertilePoint < numberOfFertilePoint) {
            if (fertilePoint == 0) {//first fertilePoint is the center
                var fertileX = zoneWidth / 2;
                var fertileY = zoneHeight / 2;
            } else { //random fertilepoint
                var tempX = Math.ceil(Math.random()*(zoneWidth/5));//on fait en sorte que le point ne soit pas sur les bords: pas dans les 10% aux bords
                var tempY = Math.ceil(Math.random()*(zoneHeight/5));
                var fertileX = tempX + Math.round(zoneWidth/10);
                var fertileY = tempY + Math.round(zoneHeight/10);
            }
            //Test si ce fertile point peut etre placer ici
            var cancel = false;
            for ( var i = 0; i < radiusFertilePoint; i++) {
                for ( var j = 0; j < radiusFertilePoint; j++) {
                    var tempX = fertileX + i;
                    var tempY = fertileY + j;
                    if (tempX > 0 && tempX < zoneWidth && tempY > 0 && tempY < zoneHeight) {
                        if (fertilityMap[tempX][tempY] > 95) {
                            cancel = true;
                        }
                    }
                    var tempX = fertileX - i;
                    var tempY = fertileY - j;
                    if (tempX > 0 && tempX < zoneWidth && tempY > 0 && tempY < zoneHeight) {
                        if (fertilityMap[tempX][tempY] > 95) {
                            cancel = true;
                        }
                    }
                }
            }
            if (!cancel) {
                fertilityMap[fertileX][fertileY] = 100;
                for ( var i = 0; i < radiusFertilePoint *2; i++) {
                    for ( var j = 0; j < radiusFertilePoint *2; j++) {
                        var distance  = i + j;
                        var fertilityBonus = 80 - distance * (radiusFertilePoint + 6);
                        if (fertilityBonus < 0) {
                            fertilityBonus = 0;
                        }
                        var tempX = fertileX + i;
                        var tempY = fertileY + j;
                        if (tempX > 0 && tempX < zoneWidth && tempY > 0 && tempY < zoneHeight) {
                            fertilityMap[tempX][tempY] = fertilityMap[tempX][tempY] + fertilityBonus;
                            if (fertilityMap[tempX][tempY] > 100) {
                                fertilityMap[tempX][tempY] = 100;
                            }
                        }
                        var tempX = fertileX - i;
                        var tempY = fertileY - j;
                        if (tempX > 0 && tempX < zoneWidth && tempY > 0 && tempY < zoneHeight) {
                            fertilityMap[tempX][tempY] = fertilityMap[tempX][tempY] + fertilityBonus;
                            if (fertilityMap[tempX][tempY] > 100) {
                                fertilityMap[tempX][tempY] = 100;
                            }
                        }
                    }
                }
                fertilePoint++;
            }
        }
        
        
        var tab = [];
        for ( var i = 1; i < (zoneWidth+1); i++) {
            for ( var j = 1; j < (zoneHeight+1); j++) {
                //the squares around the center belong to the player
                var ownerId = null;
                if ((i == centerx || i == (centerx-1) || i == (centerx+1)) && (j == centery || j == (centery-1) || j == (centery+1))) {
                    ownerId = player.user_id;
                }
                tab.push({
                    x : startx+i,
                    y : starty+j,
                    humidity : humidityMap[i][j],
                    fertility : fertilityMap[i][j],
                    owner_id : ownerId
                });
            }
        }
        
        squareDao.insertSquares(tab, function () { });
        
        //Set the user at the center of his zone
        var data = {};
        data.x = (startx+centerx);
        data.y = (starty+centery);
        data.weapon_id = 0;//fork
        data.health = 100;//fork
        userWeaponDao.insert({user_id : player.user_id, weapon_id:0}, function() {});
        userDao.update(data, {user_id : player.user_id}, function () {
            console.log('A new player has joined the game : ' + player.name);
            world.numberOfPlayer++;
            callback();
        });
    });
};
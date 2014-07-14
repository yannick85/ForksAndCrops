function init () {
    chat.init();
    initSocket();
    
    showUserPositionInfo();
    showUsername(playerData.name);
    showMoney(playerData.money);
    showHealth(playerData.health);
    showLevel(playerLevel);
    showExperienceToUp(playerExperienceToUp);
    showTerritorySize(playerTerritorySize);
    
    player = new MyPlayer();

    canvas.bringToFront(player);
    
    refreshTimeout = setInterval(function () {
        canvas.renderAll();
        for (var id in players) {
            canvas.bringToFront(players[id]);
            canvas.bringToFront(players[id].legend);
        };
        canvas.bringToFront(player);
        canvas.bringToFront(player.legend);
    }, refreshTime);
    
    sound.startBackgroundMusic();
}

function showSquares(squares) {
    for (var key in squares) {
        var square = squares[key];
        if (tabSquares[square.x] == undefined)  {
            tabSquares[square.x] = {};
        }
        if (tabSquares[square.x][square.y] == null) {
            var s = new Square(square);
            tabSquares[square.x][square.y] = s;
            canvas.add(s);
            canvas.sendToBack(s);
        } else {
            tabSquares[square.x][square.y].update(square);
        }
    }
    if (selectedSquare == null) {
        tabSquares[currentUserX][currentUserY].select();
    }
    refreshMapInterval = setTimeout(function () {
        server.getSquares();
    }, refreshMapIntervalTime);
}

function slide (x,y) {
    for ( var keyX in tabSquares) {
        for ( var keyY in tabSquares[keyX]) {
            if (tabSquares[keyX][keyY] != null){
                tabSquares[keyX][keyY].slide(x,y);
            }; 
        }
    }
    canvas.renderAll();
}
var moveLocked = false;
function tryMove(x,y) {
    if (moveLocked == false) {
        server.move(currentUserX + x, currentUserY + y);
        moveLocked = true;
    }
}
    
function move(x,y) {
    dx = x - currentUserX;
    dy = y - currentUserY;
    
    var slidex = 0;
    var slidey = 0;
    
    currentUserX = x;
    currentUserY = y;
    
    fog.slide(dx, dy);
    
    if (Math.abs(( currentUserX - currentCenterX )) > slideTolerance ) {
        slidex = slidex + ((-dx) * (squareWidth/2));
        slidey = slidey + dx * (squareHeight/2);
        currentCenterX = currentCenterX + dx;
    }
    if (Math.abs(( currentUserY - currentCenterY )) > slideTolerance ) {
        slidex = slidex + (dy * (squareWidth/2));
        slidey = slidey + (dy * (squareHeight/2));
        currentCenterY = currentCenterY + dy;
    }
    slide(slidex, slidey);
    player.hasMoved();
    for (var id in players) {
        if (id != playerData.user_id) {
            players[id].slide();
        }
    }
    showUserPositionInfo();
    tabSquares[currentUserX][currentUserY].select();
    
    //check natural events
    
    setTimeout(function () {
        moveLocked = false;
    }, (animationSpeed + refreshTime + 50));
}

function cannotmove() {
    moveLocked = false;
}

function checkCropList () {
    if (cropList == null) {
        server.getCropList();
    }
};

function setCropForSquare (cropId, square) {
    server.setCropForSquare(cropId, square);
    sound.play("setcrop.ogg");
};

function sellCrop() {
    server.sellCrop({x : selectedSquare.X, y : selectedSquare.Y});
    sound.play("harvestcrop.ogg");
}

function removeCrop() {
    server.removeCrop({x : selectedSquare.X, y : selectedSquare.Y});
    sound.play("harvestcrop.ogg");
}

function fertilizeCrop() {
    server.fertilizeCrop({x : selectedSquare.X, y : selectedSquare.Y});
}

function waterCrop() {
    server.waterCrop({x : selectedSquare.X, y : selectedSquare.Y});
}

function stockCrop() {
    /*
     * GO TO A BUILDING
     * */
}

function buySelectedTile() {
    server.buyTile({ x : selectedSquare.X, y : selectedSquare.Y });
}

function attackSelectedTile() {
    server.attackTile({ x : selectedSquare.X, y : selectedSquare.Y });
}

function showOtherPlayer(data) {
    if (players[data.user_id] == undefined) {
        new Player(data);
    } else {
        players[data.user_id].move(data.x, data.y);
    };
}
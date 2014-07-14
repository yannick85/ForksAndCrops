var socket = null;

function initSocket () {
    socket = io.connect('http://' + document.location.hostname + '');
    //TODO Meilleur système d'auth
    socket.emit('auth', {user_id : playerData.user_id});
    socket.on('needauth', function (data) {
        socket.emit('auth', {user_id : playerData.user_id});
    });
    socket.on('showtutorial', function (data) {
        showTutorial();
    });
    socket.on('infomessage', function (data) {
        showMessage(data);
    });
    socket.on('popupmessage', function (data) {
        showPopup(data.title, data.message, data.confirm);
    });
    socket.on('squares', function (data) {
        showSquares(data);
    });
    socket.on('croplist', function (data) {
        cropList = crops;
        setCropList();
    });
    socket.on('move', function (data) {
        move(data.x, data.y);
    });
    socket.on('cannotmove', function (data) {
        cannotmove();
    });
    socket.on('money', function (data) {
        showMoney(data);
    });
    socket.on('level', function (data) {
        showLevel(data);
    });
    socket.on('health', function (data) {
        showHealth(data);
    });
    socket.on('experiencetoup', function (data) {
        showExperienceToUp(data);
    });
    socket.on('experiencewon', function (data) {
        showExperienceWon(data);
    });
    socket.on('territorysize', function (data) {
        showTerritorySize(data);
    });
    socket.on('chat-show', function (data) {
        chat.addMessage(data);
    });
    socket.on('market-crop', function (data) {
        showMarketCrop(data);
    });
    socket.on('natural-event-list', function (data) {
        showNaturalEvent(data);
    });
    socket.on('weapons', function (data) {
        showWeapons(data);
    });
    socket.on('playerlist', function (data) {
        showPlayerList(data);
    });
    
    socket.on('otherplayermoved', function (data) {
        showOtherPlayer(data);
    });
};

var server = {};

server.move = function(x,y) {
    socket.emit('move', {x : x, y : y});
};

server.getSquares = function() {
    socket.emit('squares', {  });
};

server.getCropList = function() {
    socket.emit('croplist', {});
};

server.setCropForSquare = function(cropId, square) {
    socket.emit('setcrop', {crop_id : cropId, square : square});
};

server.sellCrop = function(square) {
    socket.emit('sellcrop', square);
};

server.removeCrop = function(square) {
    socket.emit('removecrop', square);
};

server.fertilizeCrop = function(square) {
    socket.emit('fertilizecrop', square);
};

server.waterCrop = function(square) {
    socket.emit('watercrop', square);
};

server.buyTile = function(square) {
    socket.emit('buytile', square);
};

server.attackTile = function(square) {
    socket.emit('attacktile', square);
};

server.chatSend = function (message) {
    socket.emit('chat-send', message);
};

server.getMarketCrop = function () {
    socket.emit('market-crop', {});
};

server.getNaturalEventList = function () {
    socket.emit('natural-event-list', {});
};

server.getWeapons = function () {
    socket.emit('weapons', {});
};

server.getPlayerList = function () {
    socket.emit('playerlist', {});
};

server.buyWeapon = function (weaponId) {
    socket.emit('buyweapon', weaponId);
};

server.equipWeapon = function (weaponId) {
    socket.emit('equipweapon', weaponId);
};
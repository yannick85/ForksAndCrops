var animationSpeed = 400;//in ms

var canvasHeight = 600;
var canvasWidth = 800;

var squareHeight = 60;
var squareWidth = 120;

var radius = 3;

var slideTolerance = 1;

var refreshTime = 75;
var refreshTimeout = null;

var player = null;

var tabSquares = {};

var selectedSquare = null;

var refreshMapIntervalTime = 5000;
var refreshMapIntervalTimeout;

var fog = null;

var players = {};

var naturalEvents = {};

var patterns = {};
var getImage = function (name) {
    return patterns['http://' + document.location.host + '/img/' + name];
};


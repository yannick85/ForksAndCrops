//include our modules
var util   = require('util');
var http  = require('http');
var url   = require('url');
var connect   = require('connect');
var net = require("net");
var dispatcher = require("./web/dispatcher");
 
console.log('Starting server');
 
var app = connect()
.use(connect.cookieParser())
.use(connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
.use(function(req, res, next){
    try {
        console.log('Incoming Request from: ' +
                     req.connection.remoteAddress +
                    ' for href: ' + url.parse(req.url).href
        );
        dispatcher.dispatch(req, res);
      } catch (err) {
        util.puts(err);
        res.writeHead(500);
        res.end('Internal Server Error. DTC !');
      } 
   }
).listen(8080, "0.0.0.0");/* Set 0.0.0.0 for prod */

var socket = require("./socket/socket");
socket.init(app);

var world = require("./world/world");
world.init();
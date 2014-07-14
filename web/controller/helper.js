var qs = require('querystring');
var view = require('../view/helper');
var userDao = require('../../dao/userDao');
var url  = require('url');

var post = "";
this.getPost = function(req, callback) {
        req.on('data', function (data) {
            post += data;
        });
        req.on('end', function () {
            callback(qs.parse(post));
            post = "";
        });
};

this.getGet = function(req) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    return query;
};

this.checkAuth = function(req, res, callback) {
    function goLogin() {
        res.writeHead(302, {
            'Location' : '/user/login'
        });
        res.end();
    }
    if (req.session.user_id == undefined) {
        var cookies = this.getCookies(req);
        if (cookies.username != "" && cookies.token != "") {
            userDao.isValidToken ( { name : cookies.username, token : cookies.token}, function(user) {
                if ( user != null ) {
                    req.session.user_id = user.user_id;
                    res.writeHead(302, {
                        'Location': '/index/index/?from_cookie=true'
                    });
                    res.end();
                }else {
                    goLogin();
                }
            });
        } else {
            goLogin();
        }
    } else {
        callback();
    }
};


this.render = function(data, path, res) {
    view.render(data, path, res);
};

this.getCookies = function(req) {
    var cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
      });
    return cookies;
};

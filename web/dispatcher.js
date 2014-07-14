var url = require("url");
var fs = require("fs");
var controller = null;
var rest = null;

this.dispatch = function (req, res) {
    var path = url.parse(req.url).path;
    var ext = path.split('.').pop();
    if (ext == "js" || ext == "css" || ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "mid" || ext == "midi" || ext == "wav"|| ext == "mp3" || ext == "ogg" || ext == "ico") {
        //File request
        fs.readFile("public"+path, function(error, file) {
            if(error) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.write(error + "\n");
                res.end();
            } else {
                switch (ext) {
                    case "wav":
                        res.writeHead(200, {"Content-Type": "audio/wav"});
                        break;
                    case "mid":
                    case "midi":
                        res.writeHead(200, {"Content-Type": "audio/midi"});
                        break;
                    case "mp3":
                        res.writeHead(200, {"Content-Type": "audio/mpeg"});
                        break;
                    case "ogg":
                        res.writeHead(200, {"Content-Type": "audio/ogg"});
                        break;   
                    case "jpg":
                    case "jpeg":
                    case "png":
                    case "gif":
                        res.writeHead(200, {"Content-Type": "image/"+ext});
                        break;
                    default :
                        res.writeHead(200, {"Content-Type": "text/"+ext});
                        break;
                }
                res.write(file);
                res.end();
            }

        });
    } else {
        //Web request
        var query = path.split("/");
        if (!(query[1])) {
            query[1] = "index";
        }
        if (query[1] == "rest") { //si requete api
            if (!(query[2])) {
                query[2] = "index";
            }
            if (!(query[3])) {
                query[3] = "index";
            }
            rest = require(("./rest/" + query[2] + "Rest.js"));
            var f = "rest." + query[3] + "(req, res);";
            eval(f);
        } else { //requete site web
            controller = require(("./controller/" + query[1] + "Controller"));
            if (!(query[2])) {
                query[2] = "index";
            }
            var f = "controller." + query[2] + "(req, res);";
            eval(f);
        }

    }

};

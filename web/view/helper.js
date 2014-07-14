var fs = require("fs");
var mustache = require("mustache");

this.render = function(data, path, res) {
    if (path.controller != undefined && path.controller != undefined) {
        fs.readFile( "web/view/" + path.controller + "/" + path.action + ".html", function(error, contentTemplate) {
            if (error != null) {
                console.log(error);
            }
            data.content = mustache.render(contentTemplate.toString(), data);
            fs.readFile("web/view/template.html", function(error, template) {
                if (error != null) {
                    console.log(error);
                }
                res.end(mustache.render(template.toString(), data));
            });
        });
    };
};

this.partial = function(data, path, callback) {
    
};
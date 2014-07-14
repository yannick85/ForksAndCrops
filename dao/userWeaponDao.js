var base = require('./base.js'); 
var sha1 = require('sha1');

this.name = "user_weapon";
this.schema = "public";

this.select = function (where, callback) {
    base.select(this, where, function (result) { callback(result.rows); });
};

this.get = function (userId, callback) {
    base.select(this, { user_id : userId }, function (result) { callback(result.rows[0]); });
};

this.insert = function(data, callback){
    base.insert(this,data,callback);
};

this.update = function (data, where, callback) {
    base.update(this, data, where, callback);
};

this.getForUser = function (userId,callback) {
    this.select({user_id : userId}, callback);
};
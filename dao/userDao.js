var base = require('./base.js'); 
var sha1 = require('sha1');

this.name = "user";
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

this.register = function(data, callback){
    data.password = sha1(data.password);
    var me = this;
    base.insert(this,data, function (result) {
        me.select({ password : data.password, name : data.name }, function (result) { callback(result[0]); });
    });
};

this.isValid = function (data,callback) {
    data.password = sha1(data.password);
    base.select(this, data, function (result) { callback(result.rows[0]); });
};

this.isValidToken = function (data,callback) {
    base.select(this, data, function (result) { callback(result.rows[0]); });
};

this.getNumberOfPlayer = function (callback) {
    base.query(
            "(SELECT COUNT(user_id) as size FROM public.user);",
            function(result) { callback(result.rows[0].size); });
};

this.getAll = function (callback) {
    base.query(
            "SELECT * FROM public.user ORDER BY public.user.name;",
            function(result) { callback(result.rows); });
};
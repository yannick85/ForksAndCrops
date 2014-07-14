var pg = require('pg'); 
var config = require('./config'); 

var client = new pg.Client(config.getConfig());
this.client = client;

client.connect();

this.query = function(statement, callback){
    var query = client.query(statement, function (err, result) {
        if (err != null) {
            console.log(err);
        }
        callback(result);
    });
};


this.insert = function (ob, data, callback) {
    if (data == undefined || data == null) {
        data = {};
    }
    var requestStr = "INSERT INTO " + ob.schema + "." + ob.name + "(";
    var cols = [];
    var values = [];
    var ids = [];
    
    var i = 1;
    for (var col in data) {
        cols.push(col);
        values.push(data[col]);
        ids.push("$"+i);
        i++;
    }
    requestStr += cols.join(',') + ") VALUES (" + ids.join(",") + ");";
    this.query({ name: "insert_" + ob.schema + "_" + ob.name + "_" + cols.join('_'), text : requestStr, values : values },
            callback);
};

this.select = function (ob, where, callback) {
    if (where == undefined || where == null) {
        where = {};
    }
    var requestStr = "SELECT * FROM " + ob.schema + "." + ob.name + " ";
    var cols = [];
    var values = [];
    var i = 1;
    var first = true;
    for (var col in where) {
        if (first) {
            requestStr += "WHERE ";
            first = false;
        } else {
            requestStr += "AND ";
        }
        requestStr += col + "=$"+i;
        cols.push(col);
        values.push(where[col]);
        i++;
    }
    requestStr += ";";
    this.query({ name: "select_" + ob.schema + "_" + ob.name + "_" + cols.join('_'), text : requestStr, values : values },
            callback);
};

this.update = function (ob, data, where,callback) {
    if (data == undefined || data == null) {
        data = {};
    }
    if (where == undefined || where == null) {
        where = {};
    }
    var requestStr = "UPDATE " + ob.schema + "." + ob.name + " SET ";
    var cols = [];
    var wheres = [];
    var values = [];
    var i = 1;
    var first = true;
    for (var col in data) {
        if (first)  {
            first = false;
        } else {
            requestStr += ",";
        }
        requestStr += col + "=$" + i + " ";
        cols.push(col);
        values.push(data[col]);
        i++;
    }
    var first = true;
    for (var col in where) {
        if (first)  {
            first = false;
            requestStr += " WHERE ";
        } else {
            requestStr += " AND ";
        }
        requestStr += col + "=$" + i + " ";
        values.push(where[col]);
        wheres.push(col);
        i++;
    }
    requestStr += ";";
    this.query({ name: "update_" + ob.schema + "_" + ob.name + "_" + cols.join('_') + wheres.join('_'), text : requestStr, values : values },
            callback);
};
var base = require('./base.js'); 

this.name = "square";
this.schema = "public";

this.select = function (where, callback) {
    base.select(this, where, function (result) { callback(result.rows); });
};

this.get = function (squareId, callback) {
    base.select(this, { square_id : squareId }, function (result) { callback(result.rows[0]); });
};

this.insert = function(data, callback){
    base.insert(this,data,callback);
};

this.update = function (data, where, callback) {
    base.update(this, data, where, callback);
};

this.insertSquares = function (tab, callback) {
    var queryStr = "";
    for (var i in tab) {
        var ob = tab[i];
        queryStr += "INSERT INTO public.square(x,y,humidity,fertility,owner_id) VALUES (" + ob.x + "," + ob.y + ", " + ob.humidity + ", " + ob.fertility + ", " + ob.owner_id + ");"
    };
    base.query(queryStr, callback);
};

this.getBase = function (userId, callback) {
    base.query(/*"(SELECT null as square_id,x, y, null as owner_id, null as owner_name, null as humidity, null as fertility, null as crop_id, null as crop_maturity, null as crop_health FROM public.square WHERE owner_id != " + userId + " OR owner_id IS NULL)" +
            " UNION " +*/
            "(SELECT square_id, square.x, square.y, owner_id, public.user.name as owner_name, humidity, fertility, crop_id, crop_maturity, crop_health FROM public.square LEFT JOIN public.user ON square.owner_id = public.user.user_id WHERE owner_id = " + userId + ");",
            function(result) { callback(result.rows); });
};

this.getTerritorySize = function (userId, callback) {
    base.query(
            "(SELECT COUNT(square_id) as size FROM public.square WHERE owner_id = " + userId + ");",
            function(result) { callback(result.rows[0].size); });
};

this.getSquaresFromCenter = function (x, y, callback) {
    var x = parseInt(x);
    var y = parseInt(y);
    var radius = 4;
    base.query("SELECT square.*, public.user.name as owner_name FROM public.square LEFT JOIN public.user ON square.owner_id = public.user.user_id WHERE square.x < " + (x+radius) + " AND square.x > " + (x-radius) + " AND square.y < " + (y+radius) + " AND square.y > " + (y-radius),
            function(result) { callback(result.rows); });
};

this.updateAll = function (data,callback) {
    var request = "";
    for (var id in data) {
        var square = data[id];
        request += "UPDATE public.square SET crop_id=" + square.crop_id + 
            ", crop_health=" + square.crop_health + 
            ", crop_maturity=" + square.crop_maturity +
            ", fertility=" + square.fertility +
            ", humidity=" + square.humidity +
            " WHERE square_id=" + square.square_id + ";";
    }
    base.query(request
        , function(result) { callback(result); });
};

this.getCount = function (callback) {
    var request = "SELECT COUNT(*) as count, MAX(x) as max_x, MAX(y) as max_y FROM public.square;";
    base.query(request
        , function(result) { callback(result.rows[0]); });
};
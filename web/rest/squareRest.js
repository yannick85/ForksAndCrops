/*var squareDao = require('../../ldao/squareDao');
var helper = require('../controller/helper');

this.index = function (req, res) {
    helper.checkAuth(req, res);
    var get = helper.getGet(req);
    squareDao.getSquaresFromCenter(get.x, get.y, function(result){
        res.end(JSON.stringify(result));
    });
};
OLD
*/
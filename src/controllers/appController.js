var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var appController = function() {

    var middleware = function(req, res, next) {
        next();
    };

    var getApp = function (req, res) {
        var appName = req.params.id;
        res.render(appName);
    };

    return {
        getApp: getApp,
        middleware: middleware
    };
};

module.exports = appController;
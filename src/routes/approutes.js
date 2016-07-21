var express = require('express');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var approuter = express.Router();

var router = function() {

    var appController = require('../controllers/appController')();

    approuter.use(appController.middleware);

    approuter.route('/:id').get(appController.getApp);

    approuter.route('/calendarH67/data').get(appController.getcalendarH67);

    approuter.route('/calendarH67/data').post(appController.postcalendarH67);

    return approuter;

};

module.exports = router;
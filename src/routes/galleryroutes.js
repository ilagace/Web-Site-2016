var express = require('express');

var mongodb = require('mongodb').MongoClient;

var galleryrouter = express.Router();

var router = function(basenav,localnav) {

    galleryrouter.route('/').get(function(req, res) {

        res.render('gallery');
    });

    return galleryrouter;

};

module.exports = router;

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var GoogleMapsAPI = require('googlemaps');

//  Setup Google Maps API
var publicConfig = {
    key: 'AIzaSyAhPi1zmHW0g3PdQgTs9rcO-3FweDPiT-U',
};
var gmAPI = new GoogleMapsAPI(publicConfig);

//  Google Maps reverse geocode API
var reverseGeocodeParams = {
    'latlng':        '0,0',
    'language':      'en'
};

var navController = function(basenav, localbasenav, indexnav, indexskip, pagesize) {

    var middleware = function(req, res, next) {
        next();
    };

    var getRoot = function (req, res) {
        res.render('navigation', {nav: basenav, link: '/navigation/'});
    };

    var getByTheme = function (req, res) {
        indexnav = req.params.id;
        var theme = localbasenav[indexnav];
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            var collection = db.collection('IvanPhotos');
            collection.distinct('folder', {theme: theme}, function(err, results) {
                if (results) {
                    res.render('navfolder', {nav: results, link: '/navigation/folder/'});
                } else {
                    res.render('navigation', {nav: basenav, link: '/navigation/'});
                }
            });
        });
    };
    var getSkipIndex = function (req, res) {
        var folder = req.params.id;
        indexskip = req.params.page;
        if (indexskip === '0') {
            indexnav = 0;
        } else {
            if (indexskip === '+') {
                indexnav += pagesize;
            } else {
                if (indexskip === '-') {
                    indexnav -= pagesize;
                }
            }
        }
        res.redirect('/navigation/folder/' + folder);
    };

    var getInFolder = function (req, res) {
        var folder = req.params.id;
        var url = 'mongodb://localhost:27017/library';
        mongodb.connect(url, function(err, db) {
            console.log(err);
            var collection = db.collection('IvanPhotos');
            var photocount = 0;
            collection.count({folder: folder}, function(err, results) {
                photocount = results;
            });
            collection.find({folder: folder}).sort({exifdate: 1, filename: 1}).limit(pagesize).skip(indexnav).toArray(function(err, results) {
                console.log(results,folder);
                if (results) {
                    var gpsdata = [];
                    var looplength = 0;
                    var themeid = localbasenav.indexOf(results[0].theme);
                    //  check if we are at the end of the folder
                    var photoend = true;
                    if (photocount > (indexnav + results.length)) {
                        photoend =  false;
                    }
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].gpsLat) {
                            looplength += 1;
                            var latstr = results[i].gpsLat.slice(',');
                            var latfloat = parseInt(latstr[0]) + parseInt(latstr[1]) / 60 + parseInt(latstr[2]) / 3600;
                            var longstr = results[i].gpsLong.slice(',');
                            var longfloat = parseInt(longstr[0]) + parseInt(longstr[1]) / 60 + parseInt(longstr[2]) / 3600;
                            reverseGeocodeParams.latlng = latfloat + ',-' + longfloat;
                            gmAPI.reverseGeocode(reverseGeocodeParams, function(err, gpsresult) {
                                if (!err && gpsresult.status === 'OK') {
                                    gpsdata.push('GPS:' + gpsresult.results[0].formatted_address);
                                } else {
                                    gpsdata.push('');
                                }
                                if (gpsdata.length === looplength) {
                                    res.render('photos',  {nav: ['Back', 'Theme'],
                                                            link: ['/navigation/' + themeid, '/navigation/'] ,
                                                            theme: basenav[themeid], results: results,
                                                            pagesize: pagesize, indexnav: indexnav, photoend: photoend,
                                                            gpsdata: gpsdata});
                                }
                            });
                        }
                    }
                    //  if no gps data available at all
                    if (looplength === 0) {
                        res.render('photos',  {nav: ['Back', 'Theme'],
                                    link: ['/navigation/' + themeid, '/navigation/'] ,
                                    theme: basenav[themeid], results: results,
                                    pagesize: pagesize, indexnav: indexnav, photoend: photoend,
                                    gpsdata: gpsdata});
                    }
                } else {
                    res.render('navigation', {nav: basenav, link: '/navigation/'});
                }
                db.close();
            });
        });
    };

    return {
        getRoot: getRoot,
        getByTheme: getByTheme,
        getSkipIndex: getSkipIndex,
        getInFolder: getInFolder,
        middleware: middleware
    };
};

module.exports = navController;
var express = require('express');

var mongodb = require('mongodb').MongoClient;

var adminrouter = express.Router();

var router = function() {

    adminrouter.route('/addphotos').get(function(req, res) {

        //  To do a walkthrough of all the photos for my web site
        var walk = require('walk'),
            options, walker;

        options = {
            followLinks: false,
            // directories with these keys will be skipped                 ,
            filters: ['thumb']
        };

        //  To read the exif data on most recent photos
        var ExifImage = require('exif').ExifImage;
        function sleep(time, callback) {
            var stop = new Date().getTime();
            while (new Date().getTime() < stop + time) {
                ;
            }
            callback();
        }

        // To read the txt file with description
        var fs = require('fs');

        //  Build an array of data for each photos on the web site
        var imagetype = ['.jpg', 'JPG','.bmp'];
        var photocounter = 0;
        var dirArray = [];

        var url = 'mongodb://localhost:27017/library';

        //  This code is meant to be run on the local machine to update the database and then copy the database to the web server
        walker = walk.walk('D:\\Web\\Web site\\Famille\\Alaska\ 2005\ v3\ Denali', options);
//        walker = walk.walk('D:\\Web\\Web site\\Yvan\\Agra\ 1990', options);

        walker.on('directories', function(root, dirStatsArray, next) {
            // dirStatsArray is an array of `stat` objects with the additional attributes
            // * type
            // * error
            // * name
            next();
        });

        walker.on('file', function(root, fileStats, next) {
            var typetest = false;
            for (var i = 0; i < imagetype.length; i++) {
                typetest = typetest || fileStats.name.indexOf(imagetype[i]) !== -1;
            }
            if (root.indexOf('v8x6') !== -1 && typetest) {
                var dirSplit = root.split('\\');
                var path = dirSplit[0] +  '\\' + 'Web Photos\\my photos' + '\\' + dirSplit[3] +  '\\' + dirSplit[4] +  '\\' + fileStats.name;

                // Get the text for the description if it exists
                var pathtxt = root.slice(0,root.indexOf(dirSplit[5])) +
                            fileStats.name.slice(0,fileStats.name.indexOf('.')) +
                            '.txt';
                var text = null;
                if (fs.existsSync(pathtxt)) {
                    text = String(fs.readFileSync(pathtxt));
                    if (text.includes('Aucune description')) {
                        text = null;
                    }
                    fs.close();
                }

                // We are now inside the image folder and we check first if photo/video already in database
                mongodb.connect(url, function(err,db) {
                    console.log(dirSplit[4], dirSplit[5], fileStats.name);
                    var collection = db.collection('IvanPhotos');
                    collection.findOne({theme: dirSplit[3], folder: dirSplit[4], subfolder: dirSplit[5], filename: fileStats.name}, function(err, results) {
                        if (!results) {
                            // if not in database build the complete data record
                            try {
                                var exifStat = new ExifImage({image : path}, function (error, exifData) {
                                    if (error) {

                                        // No exif data, get image size using image-size module
                                        var sizeOf = require('image-size');
                                        var dimensions = sizeOf(path);
                                        var fsmtime = JSON.stringify(fileStats.mtime);
                                        // Look up the photo year in folder name if no exif
                                        var yearind99 = dirSplit[4].indexOf(' 19');
                                        var yearind20 = dirSplit[4].indexOf(' 20');
                                        var yeardata = '1900';
                                        if (yearind99 !== -1) {
                                            yeardata = dirSplit[4].substring(yearind99 + 1,yearind99 + 5);
                                        }
                                        if (yearind20 !== -1) {
                                            yeardata = dirSplit[4].substring(yearind20 + 1,yearind20 + 5);
                                        }
                                        var datanoexif = {theme: dirSplit[3],
                                                    folder: dirSplit[4],
                                                    subfolder: dirSplit[5],
                                                    filename: fileStats.name,
                                                    description: text,
                                                    weblink: null,
                                                    exifDate: fsmtime.slice(1,11) + ' ' + fsmtime.slice(12,20),
                                                    year: yeardata,
                                                    photoDimW: dimensions.width,
                                                    photoDimH: dimensions.height,
                                                    camera: 'Scanned',
                                                    gpsLatRef: null,
                                                    gpsLat: null,
                                                    gpsLongRef: null,
                                                    gpsLong: null,
                                                    };
                                        collection.insertOne(datanoexif, function(err, result) {
                                            db.close();
                                        });
                                        photocounter += 1;
                                        dirArray.push(datanoexif);
                                    } else {
                                        // We have some exif data here
                                        var yearexif = exifData.exif.DateTimeOriginal.slice(0,4);
                                        var dataexif = {theme: dirSplit[3],
                                                folder: dirSplit[4],
                                                subfolder: dirSplit[5],
                                                filename: fileStats.name,
                                                description: text,
                                                weblink: null,
                                                exifDate: exifData.exif.DateTimeOriginal,
                                                year: yearexif,
                                                photoDimW: exifData.exif.ExifImageWidth,
                                                photoDimH: exifData.exif.ExifImageHeight,
                                                camera: exifData.image.Model,
                                                gpsLatRef: exifData.gps.GPSLatitudeRef,
                                                gpsLat: exifData.gps.GPSLatitude,
                                                gpsLongRef: exifData.gps.GPSLongitudeRef,
                                                gpsLong: exifData.gps.GPSLongitude,
                                                };
                                        collection.insertOne(dataexif, function(err, result) {
                                            db.close();
                                        });
                                        photocounter += 1;
                                        dirArray.push(dataexif);
                                    }
                                });
                            } catch (error) {
                                console.log('Error try: ' + error.message);
                            }
                        }
                    });
                });
            }
            next();
        });

        walker.on('errors', function(root, nodeStatsArray, next) {
            next();
        });

        walker.on('end', function() {
            console.log('folder walk completed');
        });
    });

    adminrouter.route('/contact').get(function(req, res) {
        res.render('contact');
    });

    return adminrouter;

};

module.exports = router;

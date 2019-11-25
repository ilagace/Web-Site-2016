var express = require('express');

var app = express();
var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var sharp = require('sharp');
var fs = require('fs');

//var port = process.env.PORT || 4000;
var port = 4000;
console.log('process env port: ', process.env.PORT);

var basenav = ['Ivan', 'Alex', 'Alex et les Lagace', 'Alex et les Cantin', 'Vieilles Photos Lagace', 'Vieilles Photos Cantin'];
var localbasenav = ['Yvan', 'Famille', 'Lagace', 'Cantin', 'Lagace 2', 'Cantin 2'];

//Change starting directory as the call is via Windows Services, need to be changed on AWS so I use apprmt.js there
try {
    process.chdir('D:/Software\ Development\ Projects/Web\ Site\ 2016');
    console.log('New directory:', process.cwd());
}
catch (err) {
    console.log('chdir:',err);
}
//  Windows ---  app.js
var homedir = 'D:/SoftwareAssets/public/';
var appdir = 'D:/';
//  Linux ---  apprmt.js
//var homedir = '/home/ec2-user/SoftwareAssets/public/';
//var appdir = '../';

console.log('homedir: ',homedir,'Starting directory:', process.cwd());

app.use(express.static('public'));
app.use('/', express.static('public'));
app.set('views','./src/views');

app.get('/', function (req, res) {
    var url = 'mongodb://localhost:27017/library';
    mongodb.connect(url, function(err, db) {
        var collection = db.collection('IvanPhotos');
        collection.count({mediaType: 'photo'}, function(err, results) {
            console.log(results);
            collection.find({mediaType: 'photo'}).sort({exifdate: 1, filename: 1})
                .limit(10).toArray(function(err, results) {
                if (results && results[0] !== undefined) {
                    var themeid = localbasenav.indexOf(results[0].theme);
                    // create smaller photos to speed up the load process
                    for (var j = 0; j < results.length; j++) {
                        var dir = homedir + 'assets/' + basenav[themeid] + '/' +
                            results[j].folder + '/' + 'smallPhotos';
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                        var image = sharp(homedir + 'assets/' + basenav[themeid] + '/' +
                            results[j].folder + '/' + results[j].filename);
                        resize(j, image, dir, results[j].filename);
                        console.log('resize ' + homedir + 'assets/' + basenav[themeid] + '/' +
                            results[j].folder + '/' + results[j].filename);
                    }
                    function resize(k, image, dir, filename) {
                        image.metadata().then(function(metadata) {
                            if (metadata.width > metadata.height) {
                                image.resize(300, null).toFile(dir + '/' + filename, function(err) {
                                    if (k === results.length - 1) {
                                        oncomplete();
                                    }
                                });
                            } else {
                                image.resize(null, 500).toFile(dir + '/' + filename, function(err) {
                                    if (k === results.length - 1) {
                                        oncomplete();
                                    }
                                });
                            }
                        });
                    }
                    // launch the web page only once the conversion is completed
                    function oncomplete() {
                        db.close();
                    }
                }
            });
        });
    });
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});
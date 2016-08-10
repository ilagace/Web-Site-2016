var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var parse = require('csv-parse');

function strcompare(a,b) {
    return a[1].localeCompare(b[1]);
}

var appController = function() {

    var middleware = function(req, res, next) {
        next();
    };

    var getApp = function (req, res, next) {
        var appName = req.params.id;
        var dataout = [];
        var date = new Date();

        if (appName.indexOf('edit') !== -1) {
            // var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substr(0,10);
            var parser = parse({delimiter: ','}, function(err, data) {
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = 'tiny_avatar.png';
                    data[i][3] = 'http://www.gocomics.com' + data[i][3];
                    dataout.push(data[i]);
                }
            });
            var parser2 = parse({delimiter: ','}, function(err, data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i][1] !== 'tbd') {
                        data[i][0] = data[i][2] + '.bmp';
                        data[i][3] = 'http://www.oregonlive.com/comics-kingdom/?feature_id=' + data[i][3].substr(1,data[i][3].length);
                        dataout.push(data[i]);
                    }
                }
                res.render(appName, {data:dataout.sort(strcompare)});
            });
            dataout.push(['dilbert.png','Dilbert','miscellaneous','http://www.dilbert.com']);
            dataout.push(['archie.png','Archie','miscellaneous','http://www.arcamax.com/thefunnies/archie/']);
            dataout.push(['mrboffoz.jpg','Mr. Boffo','miscellaneous','http://www.mrboffo.com']);
            fs.createReadStream('../../SoftwareAssets/public/comics/comiclistgo').pipe(parser);
            fs.createReadStream('../../SoftwareAssets/public/comics/comiclistoregonedited').pipe(parser2);
        } else {
            res.render(appName);
        }
    };

    var editPost = function(req, res, next) {
        console.log(req.body);
    };

    return {
        getApp: getApp,
        editPost: editPost,
        middleware: middleware
    };
};

module.exports = appController;
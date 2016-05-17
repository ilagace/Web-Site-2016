var express = require('express');

var app = express();

var port = process.env.PORT || 5000;

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');

var basenav = ['Ivan', 'Alex', 'Alex et les Lagacé', 'Alex et les Cantin', 'Vieilles Photos Lagace', 'Vieilles Photos Cantin'];
var localbasenav = ['Yvan', 'Famille', 'Lagace', 'Cantin', 'Lagace', 'Cantin'];
var category = ['Mountains', 'Sea', 'Cities', 'Friendship', 'Family', 'Culture', 'Sports'];
var indexnav = 0;
var pagesize = 80;
var indexskip = '0';

var navrouter = require('./src/routes/navroutes')(basenav, localbasenav, indexnav, indexskip, pagesize);
var adminrouter = require('./src/routes/adminroutes')(basenav, localbasenav, category);
var searchrouter = require('./src/routes/searchroutes')(basenav, localbasenav);
var galleryrouter = require('./src/routes/galleryroutes')(basenav, localbasenav);

app.use(express.static('public'));
app.use('/navigation', express.static('public'));
app.use('/gallery', express.static('public'));
app.use('/navigation/folder', express.static('public'));
app.use('/navigation/folder/assets', express.static('public'));
app.use('/admin/contact', express.static('public'));
app.use('/admin/managemedia', express.static('public'));
app.set('views','./src/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'ivanlibrary'}));
require('./src/config/passport')(app);

/* how to setup handelbars

var handlebars = require('express-handlebars');

app.engine('.hbs', handlebars({extname: '.hbs'}));

app.set('view engine','.hbs');

setup ejs or jade below

*/

app.set('view engine','ejs');

app.use('/navigation', navrouter);
app.use('/admin', adminrouter);
app.use('/search', searchrouter);
app.use('/gallery', galleryrouter);

app.get('/', function (req, res) {
    res.render('index', {title:'Splash Page'});
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});
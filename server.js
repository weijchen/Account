// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                        // create our app w/ express
    var mongoose = require('mongoose');              // mongoose for mongodb
    var morgan   = require('morgan');                // log requests to the console (express4)
    var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var database = require('./config/database');
    var port     = process.env.PORT || 3000;         // set the port
    var routes = require('./routes/index');
    var api = require('./routes/api');
    var path = require('path');
    var passport = require('passport');
    var session = require('express-session');
    var flash = require('connect-flash');


    // configuration ===============================================================
    mongoose.connect(database.url);     // connect to mongoDB database on modulus.io
    // app.engine('.ejs', require('ejs').__express);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    // app.set('views', __dirname + '/public');
    // app.set('view engine', 'ejs');
    app.use(express.static(__dirname + '/public'));
    // app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    // routes ======================================================================
    app.use('/', routes);
    app.use('/api', api);
    require('./config/passport')(passport);

    // listen (start app with node server.js) ======================================
    app.listen(port);
    console.log("App listening on port : " + port);

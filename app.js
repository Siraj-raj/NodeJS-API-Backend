'use strict';

require('rootpath')();
require('dotenv').config();

var session = require('express-session');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var jwttoken = require('jsonwebtoken');
var cors = require('cors');
var errorHandler = require('app/helper/error-handler');
var jwt = require('app/helper/jwt');
var config = require('app/config/config');
var LocalStrategy = require('passport-local').Strategy;
var User = require('app/user/user.model');

var app = express();

var port = process.env.PORT || 4000;

var userService = require('app/user/user.service');

mongoose.connect(config.db);
console.log("------------- Database connected successfully ----------------" + config.db);

app.use(cors());
app.use(jwt());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/asset'));
app.use(session({ secret: 'session secret', cookie: {}, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


passport.serializeUser((u, done) => { done(null, u._id); });

passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


passport.use('signin', new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true }, userService.signin));
passport.use('signup', new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true }, userService.signup));

app.post('/api/user/signin', (req, res, next) => {
    passport.authenticate('signin', (err, user, info) => {
        if (err) { return next(err); }
        if (user) {
            let { password, ...userWithoutPass } = user.toObject();
            let token = jwttoken.sign({ userID: user._id }, config.secret);
            res.json({ success: true, user: userWithoutPass, token: token });
        } else {
            res.json({ success: false, message: info.message });
        }
    })(req, res, next);
});

app.post('/api/user/signup', (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
        if (err) { return next(err); }
        if (user) {
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: info.message });
        }
    })(req, res, next);
});

app.get('/api/user/signout', (req, res) => {
    console.log(req.user);
    req.logout();
    res.json({ success: true })
});

app.use('/api/user', require('app/user/user.controller'));
app.use('/api/project', require('app/project/project.controller'));

app.use(errorHandler);

var appServer = app.listen(port, function () {
    var host = appServer.address().address;
    var port = appServer.address().port;

    console.log('\nApp listening at http://%s:%s\n', host, port);
});


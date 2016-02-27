// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
// var TwitterStrategy = require('passport-twitter').Strategy;
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var Account = require('../models/account');

// load the auth variables
var configAuth = require('./env'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(account, done) {
        done(null, account.id);
    });

    passport.deserializeUser(function(id, done) {
        Account.findById(id, function(err, account) {
            done(err, account);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with username
            usernameField: 'text',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, username, password, done) {
            if (username)
                username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function() {
                Account.findOne({
                    'username': username
                }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else{
                        req.account = user;
                        return done(null, user);
                    }
                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with username
            usernameField: 'text',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, username, password, done) {
            if (username)
                username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function() {
                // if the user is not already logged in:
                if (!req.account) {
                    Account.findOne({
                        'username': username
                    }, function(err, account) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that username
                        if (account) {
                            return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                        } else {

                            // create the user
                            var newAccount = new Account();

                            newAccount.username = username;
                            newAccount.password = newAccount.generateHash(password);

                            newAccount.save(function(err) {
                                if (err)
                                    return done(err);
                                req.account = account;
                                return done(null, newAccount);
                            });
                        }

                    });
                    // if the user is logged in but has no local account...
                } else if (!req.account.username) {
                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the username used to connect a local account is being used by another user
                    Account.findOne({
                        'username': username
                    }, function(err, account) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false, req.flash('loginMessage', 'That username is already taken.'));
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = req.account;
                            user.username = username;
                            user.password = user.generateHash(password);
                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                req.account = account;
                                return done(null, account);
                            });
                        }
                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.account);
                }

            });

        }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            Account.findOne({ 'facebook.id' : profile.id }, function(err, account) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (account) {
                    return done(null, account); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newAccount = new Account();
                    console.log(profile);
                    // set all of the facebook information in our user model
                    newAccount.facebook.id    = profile.id; // set the users facebook id                   
                    newAccount.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newAccount.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    // newAccount.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newAccount.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newAccount);
                    });
                }
            });
        });

    }));
    //     // =========================================================================
    //     // TWITTER =================================================================
    //     // =========================================================================
    //     passport.use(new TwitterStrategy({

    //         consumerKey     : configAuth.twitterAuth.consumerKey,
    //         consumerSecret  : configAuth.twitterAuth.consumerSecret,
    //         callbackURL     : configAuth.twitterAuth.callbackURL,
    //         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    //     },
    //     function(req, token, tokenSecret, profile, done) {

    //         // asynchronous
    //         process.nextTick(function() {

    //             // check if the user is already logged in
    //             if (!req.user) {

    //                 User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
    //                     if (err)
    //                         return done(err);

    //                     if (user) {
    //                         // if there is a user id already but no token (user was linked at one point and then removed)
    //                         if (!user.twitter.token) {
    //                             user.twitter.token       = token;
    //                             user.twitter.username    = profile.username;
    //                             user.twitter.displayName = profile.displayName;

    //                             user.save(function(err) {
    //                                 if (err)
    //                                     return done(err);

    //                                 return done(null, user);
    //                             });
    //                         }

    //                         return done(null, user); // user found, return that user
    //                     } else {
    //                         // if there is no user, create them
    //                         var newAccount                 = new User();

    //                         newAccount.twitter.id          = profile.id;
    //                         newAccount.twitter.token       = token;
    //                         newAccount.twitter.username    = profile.username;
    //                         newAccount.twitter.displayName = profile.displayName;

    //                         newAccount.save(function(err) {
    //                             if (err)
    //                                 return done(err);

    //                             return done(null, newAccount);
    //                         });
    //                     }
    //                 });

    //             } else {
    //                 // user already exists and is logged in, we have to link accounts
    //                 var user                 = req.user; // pull the user out of the session

    //                 user.twitter.id          = profile.id;
    //                 user.twitter.token       = token;
    //                 user.twitter.username    = profile.username;
    //                 user.twitter.displayName = profile.displayName;

    //                 user.save(function(err) {
    //                     if (err)
    //                         return done(err);

    //                     return done(null, user);
    //                 });
    //             }

    //         });

    //     }));

    //     // =========================================================================
    //     // GOOGLE ==================================================================
    //     // =========================================================================
    // passport.use(new GoogleStrategy({

    //     clientID        : configAuth.googleAuth.clientID,
    //     clientSecret    : configAuth.googleAuth.clientSecret,
    //     callbackURL     : configAuth.googleAuth.callbackURL,
    //     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    // },
    // function(req, token, refreshToken, profile, done) {

    //     // asynchronous
    //     process.nextTick(function() {

    //         // check if the user is already logged in
    //         if (!req.user) {

    //             User.findOne({ 'google.id' : profile.id }, function(err, user) {
    //                 if (err)
    //                     return done(err);

    //                 if (user) {

    //                     // if there is a user id already but no token (user was linked at one point and then removed)
    //                     if (!user.google.token) {
    //                         user.google.token = token;
    //                         user.google.name  = profile.displayName;
    //                         user.google.username = (profile.usernames[0].value || '').toLowerCase(); // pull the first username

    //                         user.save(function(err) {
    //                             if (err)
    //                                 return done(err);

    //                             return done(null, user);
    //                         });
    //                     }

    //                     return done(null, user);
    //                 } else {
    //                     var newAccount          = new User();

    //                     newAccount.google.id    = profile.id;
    //                     newAccount.google.token = token;
    //                     newAccount.google.name  = profile.displayName;
    //                     newAccount.google.username = (profile.usernames[0].value || '').toLowerCase(); // pull the first username

    //                     newAccount.save(function(err) {
    //                         if (err)
    //                             return done(err);

    //                         return done(null, newAccount);
    //                     });
    //                 }
    //             });

    //         } else {
    //             // user already exists and is logged in, we have to link accounts
    //             var user               = req.user; // pull the user out of the session

    //             user.google.id    = profile.id;
    //             user.google.token = token;
    //             user.google.name  = profile.displayName;
    //             user.google.username = (profile.usernames[0].value || '').toLowerCase(); // pull the first username

    //             user.save(function(err) {
    //                 if (err)
    //                     return done(err);

    //                 return done(null, user);
    //             });

    //         }

    //     });

    // }));

};

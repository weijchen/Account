var express = require('express');
var router = express.Router();
var passport = require('passport');

// GET home page ==================================================================
	router.get('/', function(req, res, next) {
		res.render('index', { title: 'Express' });
	});

// LOGIN ==========================================================================
	//show the signup form
	router.get('/login', function(req, res){
		res.render('login.ejs', {message: req.flash('loginMessage')});
	});
	//process the signup form
	// router.post('/signup', passport.authenticate('local-signup',{
 //        successRedirect : '/profile', // redirect to the secure profile section
 //        failureRedirect : '/signup', // redirect back to the signup page if there is an error
 //        failureFlash : true // allow flash messages
	// }));

// SIGNUP ==========================================================================
	//show the signup form
	router.get('/signup', function(req, res){
		res.render('signup.ejs', {message: req.flash('signupMessage')});
	});
	//process the signup form
	router.post('/signup', passport.authenticate('local-signup',{
        successRedirect : '/profile', // redirect to index section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
	}));
// PROFILE ==========================================================================
	router.get('/profile', isLoggedIn, function(req, res){
		res.render('profile.ejs', {
			account: req.user
		});
	});
// LOGOUT ==========================================================================
	router.get('/logout', function(req, res){
		req.logout('');
		res.redirect('/');
	});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
};

module.exports = router;
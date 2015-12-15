var express = require('express');
var router = express.Router();
// load the account model
var Account = require('../models/account');
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// router/routes.js
// expose the routes to our router with module.exports
// module.exports = function(router, passport) {

// api ---------------------------------------------------------------------
// get all accounts
router.get('/accounts', function(req, res) {
    // use mongoose to get all accounts in the database
    Account.find(function(err, account) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(account); // return all accounts in JSON format
    });
});

// create account and send back all accounts after creation
router.post('/accounts', function(req, res) {

    // create a account, information comes from AJAX request from Angular
    Account.create({
        username: req.body.text,
        password: req.body.password,
        done : false
    }, function(err, account) {
        if (err)
            res.send(err);

        // get and return all the accounts after you create another
        Account.find(function(err, accounts) {
            if (err)
                res.send(err)
            res.json(accounts);
        });
    });
    console.log(req.body);
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
// router.post('/login', function(req, res){
//     var username = req.body.text;
//     var password = req.body.password;
//     Account.findOne({'username': username}, function(err, user){
//         if(err){
//             console.log(err);
//             res.send('Account not exist!');
//         }
//         console.log(err, user);

//         if(user !== null && user.validPassword(password) ){
//             console.log(user);
//             req.user = user;
//             res.redirect('/profile');
//         }else{
//             res.send('Wrong Password!');
//         }

//     });
// });

module.exports = router;
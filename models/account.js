// app/models/todo.js

// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs'); //密碼加密功能

// module.exports = mongoose.model('Account', {
//     username: String,
//     password : String,
//     done : Boolean
// });

var accountSchema = mongoose.Schema({
	username: String,
    password : String,
    done : Boolean
});

// generating a hash
accountSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    console.log('hi');
};

// checking if password is valid
accountSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
// create the model for users and expose it to our app
module.exports = mongoose.model('Account', accountSchema);  ///bcrypt


// var accountSchema = mongoose.Schema({
// 	'local' : {
// 		name: String,
// 	    password : String,
// 	},
// 	'facebook' : {

// 	}
// });

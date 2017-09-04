var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var teamSchema = new Schema({
	teamId: {
		type: String,
		unique: true
	},
	users: [{
		name: String,
		branch: String,
		regno: String,
		email: String,
		phone: Number
	}],
	payment: {
		up: Number,
		down: Number,
	},
	authKey: String,
	transaction: [{
		tid: String,
		status: String,
		number: Number
	}]
});

module.exports = mongoose.model('Team', teamSchema);

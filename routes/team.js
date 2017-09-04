var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var cron = require('node-cron');
var helper = require('sendgrid').mail;
var sg = require('sendgrid')('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');
var Team = require('../models/team');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


//Authentication key Changer
cron.schedule('0 */8 * * *', function () {
	Team.findOne({})
		.then(function (teams) {
			if (teams[0]) {
				for (i = 0; i < teams.length; i++) {
					teams[i].authKey = hat();
					teams[i].save();
				}
			}
			console.log('Recreated');
		});
});


// Get Team Data
app.get('/', function (req, res) {
	Team.findOne({
			authKey: req.query.authKey
		})
		.then(function (team) {
			if (team)
				res.json({
					status: true,
					team: team
				});
			else
				res.json({
					status: false,
					msg: 'Invalid Request'
				});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: err
			});
		});
});

// Register Team
app.post('/register', function (req, res) {
	if (req.body.teamId && req.body.user) {
		Team.findOne({
				teamId: req.body.teamId
			})
			.then(function (teams) {
				if (!teams) {
					var team = new Team();
					team.teamId = req.body.teamId;
					team.payment.up = 0;
					team.payment.down = 100;
					team.authKey = hat();
					team.users.push(req.body.user);
					team.save()
						.then(function (team) {
							res.json({
								status: true,
								msg: 'Successfully Registered!!'
							});
						})
						.catch(function (err) {
							res.json({
								status: false,
								msg: err
							});
						});
				} else
					res.json({
						status: false,
						msg: 'TeamId already exists'
					});
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: err
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid entry !!'
		})
	}
});

// Authenticate
app.post('/login', function (req, res) {
	if (req.body.phone && req.body.teamId) {
		Team.findOne({
				teamId: req.body.teamId
			})
			.then(function (team) {
				if (team) {
					var f = 0;
					for (var i = 0; i < team.users.length; i++) {
						if (team.users[i].phone == req.body.phone) {
							f++;
						}
					}
					if (f > 0) {
						res.json({
							status: true,
							authKey: team.authKey,
							msg: 'Successfully logged in !!'
						});
					} else {
						res.json({
							status: false,
							msg: 'Phone Number not registered'
						})
					}
				} else
					res.json({
						status: false,
						msg: 'Invalid TeamId'
					});
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: err
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid entry !!'
		})
	}
});

// Add a team member
app.post('/addMember', function (req, res) {
	if (req.body.teamId && req.body.authKey) {
		Team.findOne({
				teamId: req.body.teamId,
				authKey: req.body.authKey
			})
			.then(function (team) {
				if (team) {
					var p = 0;
					for (var i = 0; i < team.users.length; i++) {
						if (team.users[i].phone == req.body.user.phone) {
							p++;
						}
					}
					if (p == 0) {
						team.users.push(req.body.user);
						team.save();
						res.json({
							status: true,
							msg: 'Successfully added team member: ' + req.body.user.name
						});
					} else
						res.json({
							status: false,
							msg: 'Phone number is already registered'
						});
				} else
					res.json({
						status: false,
						msg: 'Invalid Request'
					});
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: err
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid entry !!'
		})
	}
});

// Edit Team Member
app.post('/editMember', function (req, res) {
	Team.findOne({
			teamId: req.body.teamId,
			authKey: req.body.authKey
		})
		.then(function (team) {
			if (team) {
				for (var i = 0; i < team.users.length; i++)
					if (team.users[i]._id == req.body.user._id) {
						team.users[i].name = req.body.user.name;
						team.users[i].phone = req.body.user.phone;
						team.users[i].email = req.body.user.email;
						team.users[i].regno = req.body.user.regno;
						team.users[i].branch = req.body.user.branch;
						break;
					}
				team.save();
				res.json({
					status: true,
					msg: 'Successfully edited team member: ' + req.body.user.name
				});
			} else
				res.json({
					status: false,
					msg: 'Invalid Request'
				});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: err
			});
		});
});

// Add Transaction - Request
app.post('/addTransaction', function (req, res) {
	if (req.body.authKey && req.body.teamId) {
		Team.findOne({
				teamId: req.body.teamId,
				authKey: req.body.authKey
			})
			.then(function (team) {
				if (team) {
					team.transaction.push({
						tid: req.body.tid,
						number: req.body.phone,
						status: false
					});
					team.save();
					res.json({
						status: true,
						msg: 'Payment Verification request sent!!'
					});
				} else
					res.json({
						status: false,
						msg: 'Invalid Request'
					});
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: err
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid entry !!'
		})
	}
});

// Authenticate Admin
app.post('/adminLogin', function (req, res) {
	if (req.body) {
		if (req.body.uname == 'sweasrm' && req.body.pass == 'illuminati@SWEA')
			res.json({
				status: true,
				adminKey: '94b9857b25934b76be168e6063594e7e',
				msg: 'Successfully logged in !!'
			});
		else
			res.json({
				status: false,
				msg: 'Invalid username / password'
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		})
	}
});

// Admin Data GET
app.get('/adminGet', function (req, res) {
	if (req.query.adminKey == '94b9857b25934b76be168e6063594e7e') {
		Team.find({})
			.then(function (teams) {
				var data = {};
				data.teams1 = [];
				data.teams2 = [];
				data.teams3 = [];
				data.teams_count = teams.length;
				data.participants = 0;
				data.payment = {};
				data.payment.up = 0;
				data.payment.down = 0;
				for (i = 0; i < teams.length; i++) {
					data.participants += teams[i].users.length;
					data.payment.up += teams[i].payment.up;
					data.payment.down += teams[i].payment.down;
					if (teams[i].payment.up == 0)
						data.teams1.push({
							teamId: teams[i].teamId,
							users: teams[i].users,
							payment: teams[i].payment,
							user_count: teams[i].users.length,
							transaction: teams[i].transaction
						});
					else if (teams[i].payment.up < teams[i].payment.down || teams[i].payment.up > teams[i].payment.down)
						data.teams2.push({
							teamId: teams[i].teamId,
							users: teams[i].users,
							payment: teams[i].payment,
							user_count: teams[i].users.length,
							transaction: teams[i].transaction
						});
					else
						data.teams3.push({
							teamId: teams[i].teamId,
							users: teams[i].users,
							payment: teams[i].payment,
							user_count: teams[i].users.length,
							transaction: teams[i].transaction
						});
				}
				res.json({
					status: true,
					data: data
				});
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: 'Some error!!'
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		});
	}
});

// Admin Delete a Team
app.post('/deleteTeam', function (req, res) {
	if (req.body.adminKey == '94b9857b25934b76be168e6063594e7e') {
		Team.findOne({
				teamId: req.body.teamId
			})
			.then(function (team) {
				if (team) {
					team.remove();
					res.json({
						status: true,
						msg: 'Deleted Team with TeamId: ' + req.body.teamId
					});
				} else {
					res.json({
						status: false,
						msg: 'Invalid Request'
					});
				}
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: 'Some error!!'
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		});
	}
});

// Add/Reduce Payment
app.post('/paymentHandler', function (req, res) {
	if (req.body.adminKey == '94b9857b25934b76be168e6063594e7e') {
		Team.findOne({
				teamId: req.body.teamId
			})
			.then(function (team) {
				if (team) {
					team.payment.up += Number(req.body.money);
					team.save();
					res.json({
						status: true,
						msg: 'Successfully edited payment for team: ' + req.body.teamId
					});
				} else {
					res.json({
						status: false,
						msg: 'Invalid Request'
					});
				}
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: 'Some error!!'
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		});
	}
});

// Change Transaction Status
app.post('/changeTransactionStatus', function (req, res) {
	if (req.body.adminKey == '94b9857b25934b76be168e6063594e7e') {
		Team.findOne({
				teamId: req.body.teamId
			})
			.then(function (team) {
				if (team) {
					for (i = 0; i < team.transaction.length; i++)
						if (team.transaction[i]._id == req.body.tid)
							team.transaction[i].status = req.body.status;
					team.save();
					res.json({
						status: true,
						msg: 'Successfully edited transaction status for team: ' + req.body.teamId
					});
				} else {
					res.json({
						status: false,
						msg: 'Invalid Request'
					});
				}
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: 'Some error!!'
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		});
	}
});

// Send Status
app.post('/sendStatus', function (req, res) {
	if (req.body.adminKey == '94b9857b25934b76be168e6063594e7e') {
		Team.findOne({
				teamId: req.body.teamId
			})
			.then(function (team) {
				if (team) {
					for (i = 0; i < team.users.length; i++) {
						var from = new helper.Email('support@sweassociation.in');
						var to = new helper.Email(team.users[i].email);
						var subject = 'Payment Status from ILLUMINATI';
						var body = new helper.Content('text/html', 'Hello ' + team.users[i].name + ",<br> Your teams payment status has been updated, login to check. <a href='https://sweassociation.in/illuminati/'>Click Here</a>");
						var mail = new helper.Mail(from, subject, to, body);
						var request = sg.emptyRequest({
							method: 'POST',
							path: '/v3/mail/send',
							body: mail.toJSON(),
						});
						sg.API(request);
					}
					res.json({
						status: true,
						msg: 'Status successfully sent !!'
					});
				} else {
					res.json({
						status: false,
						msg: 'Invalid Request'
					});
				}
			})
			.catch(function (err) {
				res.json({
					status: false,
					msg: 'Some error!!'
				});
			});
	} else {
		res.json({
			status: false,
			msg: 'Invalid Request'
		});
	}
});


module.exports = app;

const db = require("../models");
const passport = require('../config/login-routes');
const path = require('path');

module.exports = function(app) {

	app.post("/api/login", passport.authenticate("local"), function(req, res) {
	    console.log(req.user);

	    res.json(req.user);
	});

	app.post("/api/register", function(req, res) {
		console.log(req.body);
		req.check('email', 'Invalid Email Address').isEmail();
		req.check('password', 'Password is Invalid').isLength({min: 4}).equals(req.body.confirmpassword)
		
		var errors = req.validationErrors();

		if (errors) {
			//req.session.errors = errors;
			console.log(errors);
		}else {
			db.User.create({
				email: req.body.email,
				password: req.body.password
			}).then(function() {
				res.redirect(307, '/api/login')
			}).catch(function(err) {
				console.log(err);
				res.json(err);
			});
		}
	});

	// Route for logging user out
	app.get("/logout", function(req, res) {
		req.logout();
		res.redirect("/");
	});

	// Route for getting some data about our user to be used client side
	app.get("/api/user_data", function(req, res) {
		if (!req.user) {
			res.json({});
		}
		else {
			res.json({
				email: req.user.email,
				id: req.user.id
			});
		}
	});

	app.post('/api/update', function(req, res) {
		db.User.update({
			DiagnosisId: req.body.diagnosisId
		}, {
			where: {email: req.body.email}
		}).then(function(results) {
			console.log(results)
		})
	})

	//Get request that finds all diagnoses NOT IN USE
	app.get('/api/diagnosis', function(req, res) {
		db.Diagnosis.findAll({}).then(function(results) {
			res.json(results);
		});
	});

		//GET request for finding diagnosis based on exam path
	app.get('/api/diagnosis/:diagnosis', function(req, res) {
		db.Diagnosis.findOne({
			where: {
				diagnosis: req.params.diagnosis,
			}
		}).then(function(results) {
			res.json(results);
		});
	});
}
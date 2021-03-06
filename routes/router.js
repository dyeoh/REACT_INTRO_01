var express = require('express');
var router = express.Router();
var User = require('../models/user');

// Test GET route, should return hi when tested
router.get('/test', function (req, res, next) {
	res.send("hi");
});

//POST route for login and registration (Please split this into two routes soon)
router.post('/api/signup', function (req, res, next) {
  //For registration
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

	//Saves input to a variable
    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
	  ethAdd: null,
	  zecAdd: null,
    }

	//Saves user data variable from input to database
    User.create(userData, function (error, user) {
      if (error) {
		var err = new Error('Error in registration, user might already be registered');
		err.status = 701;
        return next(err);
      } else {
        req.session.userId = user._id;
		return res.redirect('/api/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})


//POST route for login
router.post('/api/login', function (req, res, next) {
  if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
		return res.redirect('/api/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route for checking profile, returns error 400 if not logged in
router.get('/api/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
		  return res.send(JSON.stringify({username: user.username, email: user.email, zecAdd: user.zecAdd, ethAdd: user.ethAdd}));
        }
      }
    });
});

// GET for logging out, destroys cookie/session stored in mongodb 
router.get('/api/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
		  var err = new Error('You are not logged in');
			err.status = 700;
			return next(err);
      }
    });
  }
});

module.exports = router;
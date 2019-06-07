var express = require('express');
var debug = require('debug')('highlighter:users');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const bcrypt = require('bcrypt');

//Imported models
const User = require('../server/models').user;

//Default error objects
let badRequest =  {
  message: 'Bad request',
  status: false,
  data: {}
}

let serverError = {
  message: 'Something went wrong',
  status: false,
  data: {}
}

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

// Get Login page
router.get('/login', (req, res, next) => {
  // res.send('respond with a resource');
  res.render('users/login', {iserror: false});
});

//Process POST login request
router.post('/login', (req, res, next) => {
  const schema = Joi.object().keys({
    password: Joi.string().min(8).required().label('password'),
    email: Joi.string().email({ minDomainAtoms: 2 }).required().label('email')
  });
  
  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    return res.status(400).send(
      badRequest
    );
  }

  async.waterfall([
    (next) => {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user && user.dataValues) {
          return next(null, user.dataValues);
        }
        return next({ customMessage: 'Email does not exist' });
      })
    },
    (user, next) => {
      bcrypt.compare(req.body.password, user.password, (error, res) => {
        if (res) {
          return next(null, null);
        }
        return next({ customMessage: 'Invalid email/password' });
      })
    }
  ], (error, result) => {
    if (error) {
      debug('Error:', error);
      return res.render('users/login', { iserror: true, errorMessage: error.customMessage ? error.customMessage : 'Something went wrong' });
    }
    return res.render('users/done', { successMessage: 'You are logged in successfully..'});
  });
});

//Process POST signup request
router.post('/signup', (req, res, next) => {
  // res.send('respond with a resource');
  debug('Request body::', req.body);
  const schema = Joi.object().keys({
    name: Joi.string().required().label('name'),
    password: Joi.string().min(8).required().label('password'),
    email: Joi.string().email({ minDomainAtoms: 2 }).required().label('email')
  });
  
  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    return res.status(400).send(
      badRequest
    );
  }
  let createJson = req.body;
  debug('Create JSON::', createJson);
  async.waterfall([
    (next) => {
      User.findOne({ where: {email: createJson.email} }).then(user => {
        // project will be the first entry of the Projects table with the title 'aProject' || null
        debug('User found::', user);
        if (user && user.dataValues) {
          return next({customMessage: 'Username/email already exists'}, null);
        } 
        return next();
      })
    },
    (next) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          debug('While generating::', err);
          return next(err, null);
        }
        return next(null, salt);
      });
    },
    (salt, next) => {
      bcrypt.hash(createJson.password, salt, (err, hash) => {
        if (err) {
          debug('While generating hash::', err);          
          return next(err, null);
        }
        createJson.password = hash;
        return next(null, null);
      });
    }
  ], async (error, result) => {
    if (error) {
      debug('Error:', error);
      // return res.status(500).send(
      //   serverError
      // );
      return res.render('users/signup', { iserror: true, errorMessage: error.customMessage ? error.customMessage : 'Something went wrong' });
    }
    User
      .create(createJson)
      .then(user => {
        return res.render('users/done', { successMessage: 'You have registered yourself successfully..'});        
      })
      .catch(error => {
        return res.render('users/signup', { iserror: true, errorMessage: error.customMessage ? error.customMessage : 'Something went wrong' });
      });
  })
});

// Get signup page
router.get('/signup', (req, res, next) => {
  // res.send('respond with a resource');
  res.render('users/signup', {iserror: false, errorMessage: ''});
});

module.exports = router;

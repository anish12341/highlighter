var express = require('express');
var debug = require('debug')('highlighter:users');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const url = require('url');

const auth = require('./auth.js')
const utils = require('./utils.js');
const { sequelize } = require('../server/models/index.js');
const env = process.env;

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
  debug('Login body: ', req.body);
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
        // console.log('User data new::', user);
        if (user && user.dataValues) {
          return next(null, user.dataValues);
        }
        return next({ customMessage: 'Email does not exist' });
      })
    },
    (user, next) => {
      bcrypt.compare(req.body.password, user.password, (error, res) => {
        if (res) {
          return next(null, user);
        }
        return next({ customMessage: 'Invalid email/password' });
      })
    }
  ], (error, result) => {
    if (error) {
      debug('Error:', error);
      return res.render('users/login', { iserror: true, errorMessage: error.customMessage ? error.customMessage : 'Something went wrong' });
    }
    result = auth.generateAccessToken(result);
    return res.render('users/done', { successMessage: 'You are logged in successfully..', data: result });
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
        // delete user.dataValues.password;
        let result = auth.generateAccessToken(user.dataValues);
        return res.render('users/done', { successMessage: 'You have registered yourself successfully..', data: result });        
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

router.get('/forgot-password', (req, res, next) => {
  res.render('users/forgot-password', {iserror: false, errorMessage: ''});
})

router.post('/forgot-password', (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().email({ minDomainAtoms: 2 }).required().label('email')
    });
    
    const joiResult = Joi.validate(req.body, schema);
    if (joiResult.error) {
      return res.status(400).send(
        badRequest
      );
    }

    const { email: userEmail } = req.body;
    let userName;

    async.waterfall([
      (next) => {
        User.findOne({ where: { email: req.body.email } }).then(user => {
          if (user && user.dataValues) {
            return next(null, user);
          }
          return next({ customMessage: 'We could not find the given email!' });
        });
      },
      (userObj, next) => {
        const shortCode = utils.getRandomInt(1000, 9999).toString();
        const currentTime = Date.now().toString().slice(8, 13);
        const uniqueCode = shortCode + currentTime;
        console.log (userObj.dataValues);
        userObj.update({
          forgot_pass_key: uniqueCode
        })
        .then(res => {
          return next(null, { uniqueCode, name: userObj.dataValues.name });
        });
      },
      ({ uniqueCode, name }, next) => {
        userName = name;
        const transPorter = utils.getTransporter(nodemailer);
        const mailOptions = utils.getMailOptions({ userEmail, uniqueCode, name});
        transPorter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return next({ customMessage: 'Something went wrong while sending reset password code!' });
          }
          return next();
        })
      }
    ], (error, result) => {
      if (error) {
        console.log('Error:', error);
        return res.render('users/forgot-password', { iserror: true, errorMessage: error.customMessage ? error.customMessage : 'Something went wrong' });
      }
      const resetPasswordURLObj = utils.buildURLObj({ 
        urlPath: '/users/reset-password',
        queryObj: {
          email: userEmail,
          name: userName
      }});
      return res.redirect(resetPasswordURLObj);
    });
  } catch(error) {
    return res.render('users/forgot-password', { iserror: true, errorMessage: error.customMessage ? error.customMessage : 'Something went wrong' });
  }
});

router.get('/reset-password', (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required().label('name'),
    email: Joi.string().email({ minDomainAtoms: 2 }).required().label('email')
  });
  
  const joiResult = Joi.validate(req.query, schema);
  if (joiResult.error) {
    return res.status(400).send(
      badRequest
    );
  }

  const { email, name } = req.query;
  return res.render('users/reset-password', { iserror: false, errorMessage: '', email, name });
});

router.post('/reset-password', (req, res, next) => {
  const schema = Joi.object().keys({
    reset_password_code: Joi.string().min(9).max(9).required().label('Reset Password Code'),
    password: Joi.string().min(8).required().label('password'),
    confirm_password: Joi.string().min(8).required().label(' Confirm password'),
    email: Joi.string().email({ minDomainAtoms: 2 }).required().label('email'),
    name: Joi.string().required().label('name')
  });
  
  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    return res.render('users/reset-password', { 
      iserror: true, 
      errorMessage: 'Invalid Reset Password Code!', 
      email: req.body.email,
      name: req.body.name
    });
  }

  console.log(req.body);
  const { email, name, reset_password_code } = req.body;
  let { password } = req.body;
  async.waterfall([
    (next) => {
      User.findOne({
        where: {
          email,
          forgot_pass_key: reset_password_code
        }
      })
      .then(user => {
        if (user && user.dataValues) {
          return next(null, user);
        }
        return next({ customMessage: 'Invalid Reset Password Code!' });
      })
    },
    (user, next) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err, null);
        }
        return next(null, { user, salt });
      });
    },
    ({ user, salt }, next) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return next(err, null);
        }
        password = hash;
        console.log("New password!..",  hash);
        return next(null, { user });
      });
    },
    ({ user }) => {
      user.update({
        password
      })
      .then((res) => {
        return next();
      });
    }
  ], (error, res) => {
    console.log("here!!!");
    if (error) {
      return res.render('users/reset-password', { 
        iserror: true, 
        errorMessage: error.customMessage ? error.customMessage : 'Something went wrong', 
        email: req.body.email,
        name: req.body.name
      })
    }
  })
  return res.render('users/reset-done', { successMessage: 'Password changed successfully!' });
});

module.exports = router;

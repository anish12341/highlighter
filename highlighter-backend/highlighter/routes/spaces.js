var express = require('express');
var debug = require('debug')('highlighter:spaces');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const env = process.env;
const auth = require('./auth.js')

//Imported models
const Payments = require('../server/models').payments;
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

let successResponse = {
  message: "Request successful",
  status: true,
  data: {success: true}
}

router.get('/', (req, res, next) => {
  res.render('spaces/home', {});
});

router.get('/:userId', (req, res, next) => {
  User
      .findOne({where: {id: req.params.userId}})
      .then(user => {
          for(var i = 0; i < 10; i++)
              console.log();
          console.log("is Admin " + user.isadmin);
          if(true) {
              User.findAll({where: {isDeleted: false}})
                  .then(users => {
                      users.sort((a, b) => (a.id > b.id) ? 1 : -1)
                      res.render('spaces/admin', {users: users});
                  })
                  .catch( error => {
                      return serverError;
                  })
          } else {
              res.render('spaces/home', {userId: req.params.userId, isPremium: user.isPremium ? user.isPremium : false});
          }
      })
      .catch(error => {
            return serverError;
      });
});

router.post('/:userId', (req, res, next) => {
    console.log("request body " + req.body);
    console.log("request body upgrade " + req.body.upgrade);
    let isPremium = req.body.upgrade;
    var values = { isPremium: isPremium };
    var selector = {
        where: { id: req.params.userId }
    };
    User.update(values, selector)
        .then(function() {
            User.findAll({where: {isDeleted: false}})
                .then(users => {
                    users.sort((a, b) => (a.id > b.id) ? 1 : -1)
                    res.render('spaces/admin', {users: users});
                })
                .catch( error => {
                    return serverError;
                })
        })
        .catch(error => {
            serverError.data = error;
            return res.status(500).send(
                serverError
            );
        });
});

router.delete('/:userId', (req, res, next) => {
    console.log("debug 2");
    var values = { isDeleted: true };
    var selector = {
        where: { id: req.params.userId }
    };
    User.update(values, selector)
        .then(
            User.findOne({ where: { id: req.params.userId } })
                .then(user => {
                    console.log('User data updated ', user);
                    User.findAll({where: {isDeleted: false}})
                        .then(users => {
                            users.sort((a, b) => (a.id > b.id) ? 1 : -1)
                            res.render('spaces/admin', {users: users});
                        })
                        .catch( error => {
                            return serverError;
                        });
            })

        .catch( serverError));
});

router.get('/:userId/payments', (req, res, next) => {
  res.render('payments/payments', {userId: req.params.userId});
});
// Have removed Authentication, auth.authenticateJWT. Should be added later
router.post('/:userId/payments',(req, res, next) => {
  var date = new Date();
  let paymentJson = {};
  paymentJson.user_id = req.params.userId;
  paymentJson.payment_type = "Credit Card";
  paymentJson.amount = 10;
  paymentJson.payment_time = date;
  Payments
      .create(paymentJson)
      .then(payment => {
        var values = { isPremium: true };
        var selector = {
          where: { id: req.params.userId }
        };
        User.update(values, selector)
            .then(function() {
              res.render('payments/paymentSuccessFail', {userId: req.params.userId, successMessage: "Payment successful", isPayment: true});
                // res.render('users/done', {userId: req.params.userId, successMessage: "Payment successful"});
            })
            .catch(error => {
              serverError.data = error;
              return res.status(500).send(
                  serverError
              );
            });
      })
      .catch(error => {
        serverError.data = error;
        return res.status(500).send(
            serverError
        );
      });
});

module.exports = router;

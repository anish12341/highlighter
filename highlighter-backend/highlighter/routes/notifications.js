var express = require('express');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const env = process.env;
const auth = require('./auth.js');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../server/models/index.js');

const Notifications = require('../server/models').notification;

router.get('/', (req, res, next) => {
  const schema = Joi.object().keys({
    user_id: Joi.number().required().label('User ID'),
  });

  const joiResult = Joi.validate(req.query, schema);
  if (joiResult.error) {
    console.log(joiResult.error);
    return res.status(400).send(
      badRequest
    );
  }

  Notifications
  .findAll({
    where: {
      user_id: req.query.user_id
    }
  })
  .then((Notifications) => {
    console.log("Noti: ", Notifications);
    return res.status(200).send({
      status: true,
      message: 'Notifications retrieved successfully!',
      data: Notifications
    })
  })
  .catch(error => {
    serverError.data = error;
    return res.status(500).send(
      serverError
    )
  })  
  // res.render('spaces/home', {});
});

router.put('/read-all', (req, res, next) => {
  const schema = Joi.object().keys({
    user_id: Joi.number().required().label('User ID'),
  });

  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    console.log(joiResult.error);
    return res.status(400).send(
      badRequest
    );
  }

  Notifications
  .update({
      isread: true
    },
    {
      where: {
        user_id: req.body.user_id
    }
  })
  .then((Notifications) => {
    console.log("Noti: ", Notifications);
    return res.status(200).send({
      status: true,
      message: 'Notifications read successfully!',
      data: {}
    })
  })
  .catch(error => {
    serverError.data = error;
    return res.status(500).send(
      serverError
    )
  })  
  // res.render('spaces/home', {});
});



module.exports = router;
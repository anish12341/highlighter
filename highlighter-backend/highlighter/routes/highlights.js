var express = require('express');
var debug = require('debug')('highlighter:highlights');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const bcrypt = require('bcrypt');

//Imported models
const Highlights = require('../server/models').highlights;

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

//Process POST request of adding new highlight for user
router.post('/new', (req, res, next) => {
    debug("Req.body: ", req.body);
  const schema = Joi.object().keys({
    userid: Joi.number().required().label('Userid'),
    selected_html: Joi.string().required().label('Selected HTML'),
    url: Joi.string().required().label('URL'),
    xpath: Joi.string().required().label('xPath')
  });
  
  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    badRequest.data = joiResult.error;
    return res.status(400).send(
      badRequest
    );
  }

  let createJson = req.body;
  Highlights
    .create(createJson)
    .then(highlight => {
      successResponse.data = highlight;
        return res.status(200).send(
            successResponse
          );
      })
      .catch(error => {
        serverError.data = error;
        return res.status(500).send(
          serverError
        );
      });
});

router.post('/get', (req, res, next) => {
  debug("Req.body: ", req.body);
const schema = Joi.object().keys({
  userid: Joi.number().required().label('Userid'),
  selected_html: Joi.string().required().label('Selected HTML'),
  url: Joi.string().required().label('URL'),
  xpath: Joi.string().required().label('xPath')
});

const joiResult = Joi.validate(req.body, schema);
if (joiResult.error) {
  badRequest.data = joiResult.error;
  return res.status(400).send(
    badRequest
  );
}

let createJson = req.body;
Highlights
  .create(createJson)
  .then(highlight => {
    successResponse.data = highlight;
      return res.status(200).send(
          successResponse
        );
    })
    .catch(error => {
      serverError.data = error;
      return res.status(500).send(
        serverError
      );
    });
});

module.exports = router;

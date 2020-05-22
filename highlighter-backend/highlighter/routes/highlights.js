var express = require('express');
var debug = require('debug')('highlighter:highlights');
var router = express.Router();
const Joi = require('joi');
const async = require('async');

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
    xpath: Joi.string().required().label('xPath'),
    url_title: Joi.string().required().label('URL title')
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

router.get('/', (req, res, next) => {
  debug("Req.body: ", req.query);
const schema = Joi.object().keys({
  userid: Joi.number().required().label('Userid'),
  size: Joi.number().label("Number of highlights"),
  page: Joi.number().required().label("Page number"),
  to_include: Joi.number().default(0).label("Number of records to include"),
});

const joiResult = Joi.validate(req.query, schema);
if (joiResult.error) {
  badRequest.data = joiResult.error;
  return res.status(400).send(
    badRequest
  );
}
let size = req.query.size ? req.query.size : 10;
let to_include = req.query.to_include == undefined ? 0 : req.query.to_include;
Highlights
  .findAll({ 
    where: { userid: req.query.userid }, 
    limit: size,
    offset: ((req.query.page - 1) * size) - to_include})
  .then(highlight => {
    debug('Success: ', highlight.length);
    successResponse.data = highlight;
    return res.status(200).send(
      successResponse
    );
  })
  .catch(error => {
    debug('Error: ', error)
    serverError.data = error;
    return res.status(500).send(
      serverError
    );
  });
});

router.delete('/', (req, res, next) => {
  debug("Req.body: ", req.body);
  const schema = Joi.object().keys({
    highlighterid: Joi.number().required().label('Highlighter ID'),
  });

  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
  badRequest.data = joiResult.error;
  return res.status(400).send(
    badRequest
  );
  }
  Highlights
  .destroy({ 
    where: { id: req.body.highlighterid }})
  .then(numberOfDeletes => {
    successResponse.message = 'Highlight deleted successfully!'
    successResponse.data = numberOfDeletes;
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

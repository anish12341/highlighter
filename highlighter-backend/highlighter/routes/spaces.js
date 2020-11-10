var express = require('express');
var debug = require('debug')('highlighter:spaces');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const env = process.env;
const auth = require('./auth.js')

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

router.get('/', (req, res, next) => {
  res.render('spaces/home', {});
});

module.exports = router;
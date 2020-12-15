var express = require('express');
var debug = require('debug')('highlighter:highlights');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const auth = require('./auth.js');
const { sequelize } = require('../server/models/index.js');
const { QueryTypes } = require('sequelize');
const e = require('express');

//Imported models
const Highlights = require('../server/models').highlights;
const SpacesHighlights  = require('../server/models').collab_space_highlights;

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
router.post('/new', auth.authenticateJWT,(req, res, next) => {
  debug("Req.body: ", req.body);
  const schema = Joi.object().keys({
    userid: Joi.number().required().label('Userid'),
    selected_html: Joi.string().required().label('Selected HTML'),
    url: Joi.string().required().label('URL'),
    xpath: Joi.string().required().label('xPath'),
    url_title: Joi.string().required().label('URL title'),
    highlight_color: Joi.string().required().label('Highlight color'),
    current_space: Joi.number().required().label('Target space')
  });
  
  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    badRequest.data = joiResult.error;
    return res.status(400).send(
      badRequest
    );
  }

  if (req.body.userid != req.user.id) {
    return res.status(403).send(auth.unauthorizedRes);
  }

  const { current_space } = req.body;
  delete req.body.current_space;
  let createJson = req.body;
  async.waterfall([
    (next) => {
      Highlights
      .create(createJson)
      .then(highlight => {
        console.log("Highlight created!");
        return next(null, highlight);
      })
      .catch(error => {
        return next(error, null);
      });
    },
    (highlight, next) => {
      if (current_space != -1) {
        SpacesHighlights
        .create({
          space_id: current_space,
          highlight_id: highlight.id
        })
        .then(space_highlight => {
          console.log("Space highlight created: ", space_highlight);
          return next(null, highlight);
        })
        .catch(error => {
          return next(error, null);
        })
      } else {
        return next(null, highlight);
      }
    } 
  ], (error, highlight) => {
    if (error) {
      serverError.data = error;
      return res.status(500).send(
        serverError
      );
    }
    successResponse.data = highlight;
    return res.status(200).send(
      successResponse
    );
  });
});

router.get('/',  auth.authenticateJWT, (req, res, next) => {
  console.log(req.user);
  const schema = Joi.object().keys({
    userid: Joi.number().required().label('Userid'),
    type: Joi.string().required().label('Type of query'),
    size: Joi.number().label("Number of highlights"),
    page: Joi.number().label("Page number"),
    to_include: Joi.number().default(0).label("Number of records to include"),
    current_space: Joi.number().default(-1).label("Current Space"),
    url: Joi.string().default('').label("URL"),
  });

  const joiResult = Joi.validate(req.query, schema);
  if (joiResult.error) {
    console.log(joiResult.error);
    badRequest.data = joiResult.error;
    return res.status(400).send(
      badRequest
    );
  }

  if (req.query.userid != req.user.id) {
    return res.status(403).send(auth.unauthorizedRes);
  }

  if (req.query.type === 'popup') {
    let size = req.query.size ? req.query.size : 10;
    let to_include = req.query.to_include == undefined ? 0 : req.query.to_include;
    // Highlights
    // .findAll({ 
    //   where: { userid: req.query.userid }, 
    //   limit: size,
    //   offset: ((req.query.page - 1) * size) - to_include,
    //   url: req.query.url
    // })
    // AND (h.url = ${req.query.url} OR (${req.query.url} = ''))
    sequelize.query(`SELECT h.* FROM public.highlights AS h
    WHERE (h.id IN ( SELECT cs.highlight_id
    FROM public.collab_space_highlights AS cs
    WHERE (cs.space_id = ${req.query.current_space}) ) or ${req.query.current_space} = -1)
    AND h.userid = ${req.query.userid}
    ORDER BY h."createdAt"
    OFFSET (${((req.query.page - 1) * size) - to_include})
    LIMIT (${size})`, {
      type: QueryTypes.SELECT
    })
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
  } else if (req.query.type === 'content') {
    Highlights
    .findAll({ 
      where: { userid: req.query.userid, url: req.query.url }
    })
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
  }
});

router.delete('/', auth.authenticateJWT, (req, res, next) => {
  debug("Req.body: ", req.body);
  const schema = Joi.object().keys({
    userid: Joi.number().required().label('Userid'),
    highlighterid: Joi.number().required().label('Highlighter ID'),
  });

  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
  badRequest.data = joiResult.error;
  return res.status(400).send(
    badRequest
  );
  }

  if (req.body.userid != req.user.id) {
    return res.status(403).send(auth.unauthorizedRes);
  }
  
  Highlights
  .destroy({ 
    where: { id: req.body.highlighterid, userid: req.body.userid }})
  .then(numberOfDeletes => {
    successResponse.message = 'Highlight deleted successfully!'
    successResponse.data = numberOfDeletes;
    return res.status(200).send(
      successResponse
    );
  })
  .catch(error => {
    console.log("Error: ", error);
    serverError.data = error;
    return res.status(500).send(
      serverError
    );
  });
});

module.exports = router;

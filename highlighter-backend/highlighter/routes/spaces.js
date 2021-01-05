var express = require('express');
var debug = require('debug')('highlighter:spaces');
var router = express.Router();
const Joi = require('joi');
const async = require('async');
const env = process.env;
const auth = require('./auth.js');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../server/models/index.js');

//Imported models
const Payments = require('../server/models').payments;
const User = require('../server/models').user;
const Spaces = require('../server/models').collab;
const spaceUsers = require('../server/models').collab_user;
const Notifications = require('../server/models').notification;

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

let unauthorizedRes = {
  message: 'You are not authorized!',
  status: false,
  data: {}
};

router.get('/', (req, res, next) => {
  res.render('spaces/home', {});
});

router.get('/:userId', (req, res, next) => {
  User
      .findOne({where: {id: req.params.userId}})
      .then(user => {
          // for(var i = 0; i < 5; i++)
          //     console.log();
          // console.log("is Admin " + user.isadmin);
          if(user.isadmin) {
              displayAllUserInfo(res);

          } else {
              res.render('spaces/home', {userId: req.params.userId, isPremium: user.isPremium ? user.isPremium : false});
          }
      })
      .catch(error => {
            return serverError;
      });
});
function displayAllUserInfo(res) {
    User.findAll({where: {isDeleted: false}, raw: true})
        .then(users => {
            users.sort((a, b) => (a.id > b.id) ? 1 : -1)
            const promise = sequelize.query(`select space_name, user_id from public.collab_users cusr join public.collabs col on cusr.space_id = col.space_id`,
                {
                    type: QueryTypes.SELECT, raw:true
                })
            promise.then(data => {
                // console.log(data);
                users.forEach(user => {
                    user.spaces = [];
                    data.forEach(space => {
                        if(space.user_id == user.id) {
                            user.spaces.push(space.space_name);
                        }
                    })
                    // console.log("User " + user.id + " " + user.dataValues);
                })
                // console.log(users);
                res.render('spaces/admin', {users: users})
            });


        })
        .catch( error => {
            return serverError;
        })
}
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
            displayAllUserInfo(res);
        })
        .catch(error => {
            serverError.data = error;
            return res.status(500).send(
                serverError
            );
        });
});

// router.delete('/:userId', (req, res, next) => {
//     console.log("debug 2");
//     var values = { isDeleted: true };
//     var selector = {
//         where: { id: req.params.userId }
//     };
//     User.update(values, selector)
//         .then(
//             User.findOne({ where: { id: req.params.userId } })
//                 .then(user => {
//                     console.log('User data updated ', user);
//                     displayAllUserInfo(res);
//             })

//         .catch( serverError));
// });

router.get('/:userId/payments', (req, res, next) => {
  res.render('payments/payments', {userId: req.params.userId});
});
// Have removed Authentication, auth.authenticateJWT. Should be added later
router.post('/:userId/payments',(req, res, next) => {
  var date = new Date();
  let paymentJson = {};
  paymentJson.user_id = req.params.userId;
  paymentJson.payment_type = 'Credit Card';
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

router.post('/create/new', (req, res, next) => {
  console.log("req body", req.body)
  const schema = Joi.object().keys({
    name: Joi.string().required().label('Space Name'),
    members: Joi.array().required().label('Members array'),
    member_names: Joi.array().required().label('Members name array'),
    created_by: Joi.number().required().label('Created by'),
    created_by_name: Joi.string().required().label('Created by name'),
  });

  const joiResult = Joi.validate(req.body, schema);
  if (joiResult.error) {
    console.log(joiResult.error);
    return res.status(400).send(
      badRequest
    );
  }

  const { created_by, name: space_name, created_by_name } = req.body;
  let { members, member_names } = req.body;
  // members.push(created_by);
  // console.log(typeof(JSON.parse(members)))
  console.log(spaceUsers);
  async.waterfall([
    (next) => {
      Spaces
        .create({
          created_by,
          space_name
        })
        .then(collab => {
          // delete user.dataValues.password;
          console.log(collab);
          return next(null, collab.dataValues);
        })
        .catch(error => {
          console.log(error);
          return next(error, null);
        });
    },
    (collabData, next) => {
      members.map((eachMember, index) => {
        let isAdmin = false;

        if (eachMember === collabData.created_by) {
          isAdmin = true;
        }

        spaceUsers
          .create({
            space_id: collabData.space_id,
            user_id: eachMember,
            isAdmin
          })
          .then((eachSpaceUser) => {
            console.log("Inserted: ", eachSpaceUser.dataValues)
          })
          .catch(error => {
            return next(error, null);
          });

          console.log(eachMember, collabData.created_by);
          if (eachMember != collabData.created_by) {
            Notifications
            .create({
              user_id: eachMember,
              message: `${created_by_name} added you into ${space_name}`,
              isread: false
            })
            .then((eachNotification) => {
              console.log("Inserted: ", eachNotification.dataValues)
            })
            .catch(error => {
              return next(error, null);
            });
          }
          
      });
      return next(null, collabData);
    }
  ], (error, result) => {
    console.log(error, result);
    if (error) {
      serverError.data = error;
        return res.status(500).send(
          serverError
      );
    }
    return res.status(200).send(
      {
        success: true,
        space: result
      }
    )
  })  
});

router.get('/all/api', auth.authenticateJWT, (req, res, next) => {
  const schema = Joi.object().keys({
    userid: Joi.number().required().label('User ID'),
  });

  const joiResult = Joi.validate(req.query, schema);
  if (joiResult.error) {
    console.log(joiResult.error);
    return res.status(400).send(
      badRequest
    );
  }

  if (req.user.id != req.query.userid) {
    return res.status(403).send(unauthorizedRes);
  }

  sequelize.query(`SELECT res.space_name, res.created_by, res.space_id,res."isAdmin",
  ARRAY_AGG(
    json_build_object('userid', cu.user_id, 'name', u."name")) AS members
    FROM (SELECT c.space_name, c.created_by, c.space_id, b."isAdmin"
    FROM public."collabs" AS c INNER JOIN public."collab_users" AS b 
    ON c.space_id = b.space_id
    WHERE b.user_id = ${req.query.userid}
    ORDER BY c."createdAt") AS res
    INNER JOIN public."collab_users" AS cu
    INNER JOIN public."users" AS u
    ON u."id" = cu."user_id"
    ON res.space_id = cu.space_id
    GROUP BY res.space_name, res.created_by, res.space_id, res."isAdmin"`,
  {
    type: QueryTypes.SELECT
  })
  .then(Spaces => {
    return res.status(200).send({
      status: true,
      message: 'Spaces retrieved successfully!',
      data: Spaces
    })
  })
  .catch(error => {
    serverError.data = error;
    return res.status(500).send(
      serverError
    )
  })
});

router.delete('/:space_id', auth.authenticateJWT, (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      user_id: Joi.number().required().label('User ID')
    });
  
    const joiResult = Joi.validate(req.body, schema);
    if (joiResult.error) {
      console.log(joiResult.error);
      return res.status(400).send(
        badRequest
      );
    }
  
    if (req.user.id != req.body.user_id) {
      return res.status(403).send(unauthorizedRes);
    }
  
    const { space_id } = req.params;
    Spaces
    .destroy({
      where: {
        space_id
      }
    })
    .then(response => {
      return res.status(200).send({
        status: true,
        message: 'Space deleted successfully!'
      })
    })
    .catch(error => {
      console.log(error)
      serverError.data = error;
      return res.status(500).send(
        serverError
      )
    });
  } catch(error) {
    console.log("Server: ", error);
  }
});

router.get('/:space_id/highlights', auth.authenticateJWT, (req, res, next) => {
  const schema = Joi.object().keys({
    space_id: Joi.number().required().label('Space ID')
  });

  const joiResult = Joi.validate(req.params, schema);
  if (joiResult.error) {
    console.log(joiResult.error);
    return res.status(400).send(
      badRequest
    );
  }

  const querySchema = Joi.object().keys({
    userid: Joi.number().required().label('User ID'),
    search_input: Joi.string().empty('').label('Search input')
  });

  const queryJoiResult = Joi.validate(req.query, querySchema);
  if (queryJoiResult.error) {
    console.log(queryJoiResult.error);
    return res.status(400).send(
      badRequest
    );
  }

  if (req.user.id != req.query.userid) {
    return res.status(403).send(unauthorizedRes);
  }

  const { space_id } = req.params;
  req.query.search_input = req.query.search_input === '' ? '-1___ALL' : req.query.search_input;
  sequelize.query(`SELECT h.*, u.name  FROM highlights AS h INNER JOIN collab_space_highlights AS csh
  ON h.id = csh.highlight_id
  INNER JOIN users AS u
  ON u.id = h.userid
  WHERE csh.space_id = ${space_id}
  AND (
    h.selected_html ilike '%${req.query.search_input}%' 
    OR h.highlight_name ilike '%${req.query.search_input}%' 
    OR '${req.query.search_input}' = '-1___ALL'
  )
  ORDER BY h."createdAt" DESC`, {
    type: QueryTypes.SELECT
  })
  .then(response => {
    return res.status(200).send({
      status: true,
      message: 'Space highlights retrieved successfully!',
      data: response
    })
  })
  .catch(error => {
    console.log(error)
    serverError.data = error;
    return res.status(500).send(
      serverError
    )
  })
});

module.exports = router;

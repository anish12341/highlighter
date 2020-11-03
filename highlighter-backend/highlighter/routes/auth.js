const jwt = require('jsonwebtoken');
const env = process.env;
var unauthorizedRes = {
  message: 'You are not authorized!',
  status: false,
  data: {}
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, env.accesstokensecret, (err, user) => {
      if (err) {
        return res.status(403).send(unauthorizedRes);
      }

      req.user = user;
      next();
    });
  } else {
      res.status(401).send(unauthorizedRes);
  }
};

const generateAccessToken = (data) =>{
  delete data.password;
  const accessToken = jwt.sign(data, env.accesstokensecret);
  data.accesstoken = accessToken;
  return data;
}

module.exports = {authenticateJWT, generateAccessToken,unauthorizedRes};
const url = require('url');

const env = process.env;

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
  
const getTransporter = (nodemailer) => {
  return nodemailer.createTransport({
    service: env.MAILSERVICE,
    auth: {
      user: env.MAILUSERNAME,
      pass: env.MAILPASSWORD
    }
  });
}

const getMailOptions = ({ userEmail, uniqueCode, name }) => {
  return {
    from: env.MAILUSERNAME,
    to: userEmail,
    subject: 'Your Reset Password code for Highlighter',
    html: buildEmailHTML({ uniqueCode, name })
  }
}

const buildEmailHTML = ({ uniqueCode, name }) => {
  return `Hi ${name}, Please find your reset password code. 
  <h2> ${uniqueCode} </h1>.`;
}

const buildURLObj = ({ urlPath, queryObj }) => {
  return url.format({
    pathname: urlPath,
    query: queryObj
  });
}

module.exports = { getRandomInt, getTransporter, getMailOptions, buildURLObj }
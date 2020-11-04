const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const { ENVIRONMENT: env }  = process.env;
const { 
  DBDATABASE: databaseName,
  DBUSERNAME: username,
  DBPASSWORD: password,
  DBPORT: port,
  DBHOST: host
} = process.env;

const dbConnectionConfig = {
  "username": username,
  "password": password,
  "database": databaseName,
  "host": host,
  "port": port,
  "dialect": "postgres"
};

const db = {};

const sequelize = new Sequelize(
    dbConnectionConfig.database, 
    dbConnectionConfig.username, 
    dbConnectionConfig.password, 
    dbConnectionConfig
  );

fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
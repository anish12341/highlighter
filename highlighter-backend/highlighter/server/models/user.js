'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  user.associate = (models) => {
    // associations can be defined here
    user.hasMany(models.highlights, {
      foreignKey: 'userid',
      as: 'highlights',
    });
  };
  return user;
};
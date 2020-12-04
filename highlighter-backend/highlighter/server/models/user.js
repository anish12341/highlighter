'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id:{
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    isPremium: DataTypes.BOOLEAN,
    spaces_created: DataTypes.BIGINT,
    forgot_pass_key: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  user.associate = (models) => {
    // associations can be defined here
    user.hasMany(models.highlights, {
      foreignKey: 'userid',
      as: 'highlights',
    });
  };
  user.sync({alter: true}, ()=>{});
  return user;
};

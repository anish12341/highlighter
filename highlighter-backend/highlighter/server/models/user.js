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
    spaces_created: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    forgot_pass_key: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    isadmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: 'false'
    },
    isDeleted:{
      type: DataTypes.BOOLEAN,
      defaultValue: 'false'
    }
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

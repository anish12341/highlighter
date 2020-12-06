'use strict';
module.exports = (sequelize, DataTypes) => {
  const collabUser = sequelize.define('collab_user', {
    space_id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    isAdmin: DataTypes.BOOLEAN
  }, {});
  collabUser.associate = (models) => {
    // associations can be defined here
    collabUser.belongsTo(models.user, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
    });

    collabUser.belongsTo(models.collab, {
      foreignKey: 'space_id',
      onDelete: 'CASCADE',
    });
  };
  collabUser.sync({alter: true}, ()=>{});
  console.log("Returning: ", collabUser);
  return collabUser;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    notification_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.BIGINT,
    message: DataTypes.STRING,
    isread: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE
  }, {});
  notification.associate = (models) => {
    // associations can be defined here
    notification.belongsTo(models.user, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
    });
  };
  notification.sync({alter: true}, ()=>{});
  return notification;
};
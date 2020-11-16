'use strict';
module.exports = (sequelize, DataTypes) => {
  const collab = sequelize.define('collab', {
    space_id: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    space_name: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    createdAt: DataTypes.DATE
  }, {});
  collab.associate = (models) => {
    // associations can be defined here
    collab.belongsTo(models.user, {
        foreignKey: 'created_by',
        onDelete: 'CASCADE',
    });
  };
  collab.sync({alter: true}, ()=>{});
  return collab;
};
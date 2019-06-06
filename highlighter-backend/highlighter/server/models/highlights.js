'use strict';
module.exports = (sequelize, DataTypes) => {
  const highlights = sequelize.define('highlights', {
    selected_html: DataTypes.TEXT,
    url: DataTypes.STRING
  }, {});
  highlights.associate = (models) => {
    // associations can be defined here
    highlights.belongsTo(models.user, {
      foreignKey: 'userid',
      onDelete: 'CASCADE',
    });
  };
  return highlights;
};
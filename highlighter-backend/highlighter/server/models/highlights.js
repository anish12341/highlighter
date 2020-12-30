'use strict';
module.exports = (sequelize, DataTypes) => {
  const highlights = sequelize.define('highlights', {
    selected_html: DataTypes.TEXT,
    url: DataTypes.STRING,
    xpath: DataTypes.STRING,
    userid: DataTypes.INTEGER,
    url_title: DataTypes.STRING,
    highlight_color: DataTypes.STRING,
    highlight_name: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  highlights.associate = (models) => {
    // associations can be defined here
    highlights.belongsTo(models.user, {
      foreignKey: 'userid',
      onDelete: 'CASCADE',
    });
  };
  highlights.sync({alter: true}, ()=>{});
  return highlights;
};
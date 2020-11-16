'use strict';
module.exports = (sequelize, DataTypes) => {
  const collabSpaceHighlights = sequelize.define('collab_space_highlights', {
    space_id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    highlight_id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
  }, {});
  collabSpaceHighlights.associate = (models) => {
    // associations can be defined here
    collabSpaceHighlights.belongsTo(models.collab, {
        foreignKey: 'space_id',
        onDelete: 'CASCADE',
    });

    collabSpaceHighlights.belongsTo(models.highlights, {
      foreignKey: 'highlight_id',
      onDelete: 'CASCADE',
    });
  };
  collabSpaceHighlights.sync({alter: true}, ()=>{});
  return collabSpaceHighlights;
};
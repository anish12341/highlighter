'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn( 'highlights', 'url', Sequelize.STRING);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('highlights');
  }
};
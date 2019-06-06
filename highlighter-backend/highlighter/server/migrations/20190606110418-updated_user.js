'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn( 'users', 'email', Sequelize.STRING );
    queryInterface.addColumn( 'users', 'password', Sequelize.STRING );    
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
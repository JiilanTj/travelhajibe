'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Packages', 'price', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Packages', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
  }
};

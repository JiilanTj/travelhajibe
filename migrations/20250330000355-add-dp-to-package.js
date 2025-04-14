'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Packages', 'dp', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 20, // Default DP 20%
      comment: 'Down Payment percentage required for registration'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Packages', 'dp');
  }
};

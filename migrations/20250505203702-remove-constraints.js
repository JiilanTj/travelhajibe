'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove foreign key constraint from Users table
    await queryInterface.removeConstraint('Users', 'Users_agentTierId_fkey');
  },

  async down (queryInterface, Sequelize) {
    // Add back the foreign key constraint
    await queryInterface.addConstraint('Users', {
      fields: ['agentTierId'],
      type: 'foreign key',
      name: 'Users_agentTierId_fkey',
      references: {
        table: 'AgentTiers',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = [
      {
        name: 'bankName',
        type: Sequelize.STRING
      },
      {
        name: 'accountNumber',
        type: Sequelize.STRING
      },
      {
        name: 'accountName',
        type: Sequelize.STRING
      },
      {
        name: 'transferDate',
        type: Sequelize.DATE
      },
      {
        name: 'transferProof',
        type: Sequelize.STRING
      },
      {
        name: 'paymentMethod',
        type: Sequelize.STRING
      },
      {
        name: 'verificationNotes',
        type: Sequelize.TEXT
      },
      {
        name: 'notes',
        type: Sequelize.TEXT
      }
    ];

    for (const column of columns) {
      try {
        await queryInterface.addColumn('Payments', column.name, {
          type: column.type,
          allowNull: true
        });
      } catch (error) {
        console.log(`Column ${column.name} might already exist:`, error.message);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const columns = [
      'bankName',
      'accountNumber',
      'accountName',
      'transferDate',
      'transferProof',
      'paymentMethod',
      'verificationNotes',
      'notes'
    ];

    for (const column of columns) {
      try {
        await queryInterface.removeColumn('Payments', column);
      } catch (error) {
        console.log(`Error removing column ${column}:`, error.message);
      }
    }
  }
};

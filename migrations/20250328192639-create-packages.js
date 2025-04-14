'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Packages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('HAJI', 'UMROH'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      departureDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      quota: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      remainingQuota: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      facilities: {
        type: Sequelize.JSON,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      additionalImages: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Packages');
  }
};

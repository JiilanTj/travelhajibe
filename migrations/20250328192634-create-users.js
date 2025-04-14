'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('SUPERADMIN', 'ADMIN', 'AGEN', 'MARKETING', 'JAMAAH'),
        defaultValue: 'JAMAAH'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      nik: {
        type: Sequelize.STRING(16),
        allowNull: true,
        unique: true
      },
      birthPlace: {
        type: Sequelize.STRING,
        allowNull: true
      },
      birthDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE'),
        allowNull: true
      },
      maritalStatus: {
        type: Sequelize.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'),
        allowNull: true
      },
      occupation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      education: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bloodType: {
        type: Sequelize.ENUM('A', 'B', 'AB', 'O'),
        allowNull: true
      },
      emergencyContact: {
        type: Sequelize.JSON,
        allowNull: true
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};

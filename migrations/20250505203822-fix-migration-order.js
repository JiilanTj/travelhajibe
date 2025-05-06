'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('Users', { cascade: true });
    await queryInterface.dropTable('AgentTiers', { cascade: true });

    // Recreate AgentTiers table
    await queryInterface.createTable('AgentTiers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      baseCommissionRate: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      minimumJamaah: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bonusRate: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      benefits: {
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

    // Recreate Users table with all columns including agent-related ones
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
      agentTierId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'AgentTiers',
          key: 'id'
        }
      },
      referralCode: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      totalJamaah: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalCommission: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      bankInfo: {
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

    // Add indexes
    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['nik']);
    await queryInterface.addIndex('Users', ['agentTierId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users', { cascade: true });
    await queryInterface.dropTable('AgentTiers', { cascade: true });
  }
};

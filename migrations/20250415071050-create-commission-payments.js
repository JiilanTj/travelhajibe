'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create CommissionPayments table
    await queryInterface.createTable('CommissionPayments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      agentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'PROCESS', 'DONE', 'REJECTED'),
        defaultValue: 'PENDING'
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      processedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
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

    // Add paymentRequestId to Commissions table
    await queryInterface.addColumn('Commissions', 'paymentRequestId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'CommissionPayments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add indexes
    await queryInterface.addIndex('CommissionPayments', ['agentId']);
    await queryInterface.addIndex('CommissionPayments', ['status']);
    await queryInterface.addIndex('Commissions', ['paymentRequestId']);
  },

  async down(queryInterface, Sequelize) {
    // Remove paymentRequestId from Commissions
    await queryInterface.removeColumn('Commissions', 'paymentRequestId');

    // Remove indexes
    await queryInterface.removeIndex('CommissionPayments', ['agentId']);
    await queryInterface.removeIndex('CommissionPayments', ['status']);

    // Drop CommissionPayments table
    await queryInterface.dropTable('CommissionPayments');

    // Drop ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CommissionPayments_status";');
  }
};
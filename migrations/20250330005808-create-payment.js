'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      registrationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Registrations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('DP', 'INSTALLMENT', 'FULL_PAYMENT'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      dueAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total amount that should be paid for this payment'
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED'),
        defaultValue: 'PENDING',
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Payment method used (e.g., BANK_TRANSFER, CREDIT_CARD, etc.)'
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID from payment gateway'
      },
      receiptUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL to receipt/proof of payment'
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the payment was made'
      },
      verifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Tambahkan ENUM untuk Payment Type dan Status
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Payments_type" AS ENUM ('DP', 'INSTALLMENT', 'FULL_PAYMENT');
      CREATE TYPE "enum_Payments_status" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED');
    `).catch(err => {
      // Jika ENUM sudah ada, abaikan error
      console.log('ENUM types might already exist');
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Payments_type";
      DROP TYPE IF EXISTS "enum_Payments_status";
    `);
  }
};
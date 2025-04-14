'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Rename columns
    await queryInterface.renameColumn('Payments', 'transactionId', 'midtransTransactionId');
    await queryInterface.renameColumn('Payments', 'receiptUrl', 'midtransRedirectUrl');

    // 2. Add new columns
    await queryInterface.addColumn('Payments', 'midtransOrderId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Order ID from Midtrans'
    });

    await queryInterface.addColumn('Payments', 'midtransTransactionStatus', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Transaction status from Midtrans'
    });

    await queryInterface.addColumn('Payments', 'midtransPaymentType', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Payment type from Midtrans'
    });

    await queryInterface.addColumn('Payments', 'midtransPaymentCode', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Payment code or virtual account number'
    });

    // 3. Update comments
    await queryInterface.changeColumn('Payments', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Payment method used from Midtrans (bank_transfer, credit_card, gopay, etc.)'
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Rename columns back
    await queryInterface.renameColumn('Payments', 'midtransTransactionId', 'transactionId');
    await queryInterface.renameColumn('Payments', 'midtransRedirectUrl', 'receiptUrl');

    // 2. Remove added columns
    await queryInterface.removeColumn('Payments', 'midtransOrderId');
    await queryInterface.removeColumn('Payments', 'midtransTransactionStatus');
    await queryInterface.removeColumn('Payments', 'midtransPaymentType');
    await queryInterface.removeColumn('Payments', 'midtransPaymentCode');

    // 3. Revert comment updates
    await queryInterface.changeColumn('Payments', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: ''
    });
  }
};

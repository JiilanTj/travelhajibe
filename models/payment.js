'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Payment extends Model {}

Payment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  registrationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Registrations',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('DP', 'INSTALLMENT', 'FULL_PAYMENT'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total amount that should be paid for this payment'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'VERIFYING'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Payment method (bank_transfer, cash, etc.)'
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Bank name for transfer'
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Bank account number'
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Bank account name'
  },
  transferDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when the transfer was made'
  },
  transferProof: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to transfer proof image'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the payment was completed'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from admin during verification'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes from user'
  }
}, {
  sequelize,
  modelName: 'Payment',
  timestamps: true
});

module.exports = Payment;
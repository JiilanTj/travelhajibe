const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CommissionPayment extends Model {}

CommissionPayment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    agentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PROCESS', 'DONE', 'REJECTED'),
        defaultValue: 'PENDING'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    processedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'CommissionPayment',
    timestamps: true
});

// Relasi dengan Commission
CommissionPayment.associate = (models) => {
    CommissionPayment.belongsTo(models.User, {
        foreignKey: 'agentId',
        as: 'Agent'
    });
    CommissionPayment.belongsTo(models.User, {
        foreignKey: 'processedBy',
        as: 'Processor'
    });
    CommissionPayment.hasMany(models.Commission, {
        foreignKey: 'paymentRequestId',
        as: 'Commissions'
    });
};

module.exports = CommissionPayment; 
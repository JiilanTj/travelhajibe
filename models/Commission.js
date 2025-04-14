const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Commission extends Model {}

Commission.init({
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
    registrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Registrations',
            key: 'id'
        }
    },
    packagePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    commissionRate: {
        type: DataTypes.DECIMAL(4, 2), // Persentase komisi (misal: 5.00%)
        allowNull: false
    },
    commissionAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED'),
        defaultValue: 'PENDING'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Commission',
    timestamps: true
});

module.exports = Commission; 
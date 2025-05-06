const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Package extends Model {}

Package.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('HAJI', 'UMROH'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Harga dalam Rupiah'
    },
    dp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
        comment: 'Down Payment percentage required for registration'
    },
    duration: {
        type: DataTypes.INTEGER, // dalam hari
        allowNull: false
    },
    departureDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    quota: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    remainingQuota: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    facilities: {
        type: DataTypes.JSON,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    additionalImages: {
        type: DataTypes.JSON, // Array of image paths
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Package',
    timestamps: true
});

module.exports = Package; 
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {}

Document.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    registrationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Registrations',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('KTP', 'PASSPORT', 'KK', 'FOTO', 'VAKSIN', 'BUKU_NIKAH', 'IJAZAH'),
        allowNull: false
    },
    number: {
        type: DataTypes.STRING,
        allowNull: true // Nomor dokumen (ex: nomor KTP/Passport)
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: true // Untuk passport
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false // Path file
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
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
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Document',
    timestamps: true
});

module.exports = Document; 
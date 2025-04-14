const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Registration extends Model {}

Registration.init({
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
    packageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Packages',
            key: 'id'
        }
    },
    referralCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(
            'DRAFT',             // Saat pertama daftar
            'WAITING_PAYMENT',   // Menunggu pembayaran DP
            'DOCUMENT_REVIEW',   // Review dokumen
            'DOCUMENT_REJECTED', // Ada dokumen yang ditolak
            'APPROVED',          // Semua ok
            'CANCELLED',         // Dibatalkan
            'COMPLETED'          // Selesai menunaikan ibadah
        ),
        defaultValue: 'DRAFT'
    },
    mahramId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    mahramStatus: {
        type: DataTypes.ENUM('SUAMI', 'AYAH', 'KAKAK', 'ADIK', 'ANAK'),
        allowNull: true
    },
    roomType: {
        type: DataTypes.ENUM(
            'SINGLE',      // Kamar sendiri
            'DOUBLE',      // 2 orang
            'TRIPLE',      // 3 orang
            'QUAD',        // 4 orang
            'TENT_A',      // Tenda tipe A (misal: 8 orang)
            'TENT_B',      // Tenda tipe B (misal: 12 orang)
            'DORMITORY'    // Asrama/dormitory (sharing banyak orang)
        ),
        allowNull: false,
        defaultValue: 'DOUBLE'
    },
    roomPreferences: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            preferredLocation: null,    // "dekat lift", "lantai bawah", dll
            specialNeeds: null,         // "wheelchair access", "elderly friendly"
            groupPreference: null,      // "sama rombongan", "terpisah gender"
            tentSection: null,          // untuk pilihan TENT_A/TENT_B
            dormitorySection: null      // untuk pilihan DORMITORY
        }
    },
    roomMate: {
        type: DataTypes.JSON,
        allowNull: true // Menyimpan preferensi teman sekamar
    },
    specialRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true // Catatan internal
    }
}, {
    sequelize,
    modelName: 'Registration',
    timestamps: true
});

module.exports = Registration; 
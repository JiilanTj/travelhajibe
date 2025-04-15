const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('SUPERADMIN', 'ADMIN', 'AGEN', 'MARKETING', 'JAMAAH'),
        defaultValue: 'JAMAAH'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    nik: {
        type: DataTypes.STRING(16),
        allowNull: true,
        unique: true
    },
    birthPlace: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    birthDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE'),
        allowNull: true
    },
    maritalStatus: {
        type: DataTypes.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'),
        allowNull: true
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    education: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bloodType: {
        type: DataTypes.ENUM('A', 'B', 'AB', 'O'),
        allowNull: true
    },
    emergencyContact: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            name: null,
            relation: null,
            phone: null,
            address: null
        }
    },
    agentTierId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'AgentTiers',
            key: 'id'
        }
    },
    referralCode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    referredBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    totalJamaah: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalCommission: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    bankInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            bankName: null,
            accountNumber: null,
            accountHolder: null
        }
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    underscored: false,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Add method to validate password
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User; 
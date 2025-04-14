const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class AgentTier extends Model {}

AgentTier.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'
    },
    baseCommissionRate: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false // Base komisi untuk tier ini
    },
    minimumJamaah: {
        type: DataTypes.INTEGER,
        allowNull: false // Minimum jamaah untuk naik tier
    },
    bonusRate: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true // Bonus tambahan untuk tier ini
    },
    benefits: {
        type: DataTypes.JSON,
        allowNull: true // Benefits tambahan
    }
}, {
    sequelize,
    modelName: 'AgentTier',
    timestamps: true
});

module.exports = AgentTier; 
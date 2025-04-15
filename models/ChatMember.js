const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatMember extends Model {}

ChatMember.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ChatRooms',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    lastReadAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ChatMember',
    timestamps: true
});

module.exports = ChatMember;
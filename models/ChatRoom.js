const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatRoom extends Model {}

ChatRoom.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('PRIVATE', 'BROADCAST'),
        allowNull: false
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ChatRoom',
    timestamps: true
});

module.exports = ChatRoom;
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init({
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
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('TEXT', 'IMAGE', 'FILE', 'BROADCAST'),
        defaultValue: 'TEXT'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Message',
    timestamps: true
});

module.exports = Message;
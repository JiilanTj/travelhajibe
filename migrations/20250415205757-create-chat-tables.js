'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ChatRooms table
        await queryInterface.createTable('ChatRooms', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            type: {
                type: Sequelize.ENUM('PRIVATE', 'BROADCAST'),
                allowNull: false
            },
            lastMessageAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create ChatMembers table
        await queryInterface.createTable('ChatMembers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            roomId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'ChatRooms',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            lastReadAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create Messages table
        await queryInterface.createTable('Messages', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            roomId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'ChatRooms',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            senderId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            type: {
                type: Sequelize.ENUM('TEXT', 'IMAGE', 'FILE', 'BROADCAST'),
                defaultValue: 'TEXT'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            attachmentUrl: {
                type: Sequelize.STRING,
                allowNull: true
            },
            readAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Messages');
        await queryInterface.dropTable('ChatMembers');
        await queryInterface.dropTable('ChatRooms');
        
        // Drop ENUMs
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_ChatRooms_type;');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Messages_type;');
    }
};
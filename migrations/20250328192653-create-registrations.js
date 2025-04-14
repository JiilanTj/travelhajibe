'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Registrations', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            packageId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Packages',
                    key: 'id'
                }
            },
            referralCode: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM(
                    'DRAFT',
                    'WAITING_PAYMENT',
                    'DOCUMENT_REVIEW',
                    'DOCUMENT_REJECTED',
                    'APPROVED',
                    'CANCELLED',
                    'COMPLETED'
                ),
                defaultValue: 'DRAFT'
            },
            mahramId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            mahramStatus: {
                type: Sequelize.ENUM('SUAMI', 'AYAH', 'KAKAK', 'ADIK', 'ANAK'),
                allowNull: true
            },
            roomType: {
                type: Sequelize.ENUM(
                    'SINGLE',
                    'DOUBLE',
                    'TRIPLE',
                    'QUAD',
                    'TENT_A',
                    'TENT_B',
                    'DORMITORY'
                ),
                allowNull: false,
                defaultValue: 'DOUBLE'
            },
            roomPreferences: {
                type: Sequelize.JSON,
                allowNull: true
            },
            roomMate: {
                type: Sequelize.JSON,
                allowNull: true
            },
            specialRequests: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
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

        // Add indexes
        await queryInterface.addIndex('Registrations', ['userId']);
        await queryInterface.addIndex('Registrations', ['packageId']);
        await queryInterface.addIndex('Registrations', ['referralCode']);
        await queryInterface.addIndex('Registrations', ['status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Registrations');
    }
};
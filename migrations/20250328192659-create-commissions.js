'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Commissions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            agentId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            registrationId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Registrations',
                    key: 'id'
                }
            },
            packagePrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            commissionRate: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: false
            },
            commissionAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED'),
                defaultValue: 'PENDING'
            },
            paidAt: {
                type: Sequelize.DATE,
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
        await queryInterface.addIndex('Commissions', ['agentId']);
        await queryInterface.addIndex('Commissions', ['registrationId']);
        await queryInterface.addIndex('Commissions', ['status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Commissions');
    }
};
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('AgentTiers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            baseCommissionRate: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: false
            },
            minimumJamaah: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            bonusRate: {
                type: Sequelize.DECIMAL(4, 2),
                allowNull: true
            },
            benefits: {
                type: Sequelize.JSON,
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

        // Insert default tiers
        await queryInterface.bulkInsert('AgentTiers', [
            {
                id: uuidv4(),
                name: 'BRONZE',
                baseCommissionRate: 3.00,
                minimumJamaah: 0,
                bonusRate: 0.00,
                benefits: JSON.stringify({
                    description: 'Tier Pemula',
                    features: ['Akses Dashboard Dasar', 'Sistem Referral']
                }),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'SILVER',
                baseCommissionRate: 5.00,
                minimumJamaah: 5,
                bonusRate: 0.50,
                benefits: JSON.stringify({
                    description: 'Tier Menengah',
                    features: ['Semua fitur Bronze', 'Priority Support', 'Training Basic']
                }),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'GOLD',
                baseCommissionRate: 7.00,
                minimumJamaah: 10,
                bonusRate: 1.00,
                benefits: JSON.stringify({
                    description: 'Tier Professional',
                    features: ['Semua fitur Silver', 'Training Advanced', 'Marketing Kit']
                }),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('AgentTiers');
    }
};
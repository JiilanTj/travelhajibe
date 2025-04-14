'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'agentTierId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'AgentTiers',
                key: 'id'
            }
        });

        await queryInterface.addColumn('Users', 'referralCode', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('Users', 'totalJamaah', {
            type: Sequelize.INTEGER,
            defaultValue: 0
        });

        await queryInterface.addColumn('Users', 'totalCommission', {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0.00
        });

        await queryInterface.addColumn('Users', 'bankInfo', {
            type: Sequelize.JSON,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'agentTierId');
        await queryInterface.removeColumn('Users', 'referralCode');
        await queryInterface.removeColumn('Users', 'totalJamaah');
        await queryInterface.removeColumn('Users', 'totalCommission');
        await queryInterface.removeColumn('Users', 'bankInfo');
    }
};
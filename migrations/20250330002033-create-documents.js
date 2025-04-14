'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documents', {
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
      type: {
        type: Sequelize.ENUM('KTP', 'PASSPORT', 'KK', 'FOTO', 'VAKSIN', 'BUKU_NIKAH', 'IJAZAH'),
        allowNull: false
      },
      number: {
        type: Sequelize.STRING,
        allowNull: true // Nomor dokumen (ex: nomor KTP/Passport)
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true // Untuk passport
      },
      file: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      verifiedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: true
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documents');
  }
};

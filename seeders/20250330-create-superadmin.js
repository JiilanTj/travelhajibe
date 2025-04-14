'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      id: Sequelize.literal('uuid_generate_v4()'),
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@hajiumroh.com',
      password: await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || 'Superadmin123!', 10),
      fullname: 'Super Admin',
      phone: process.env.SUPERADMIN_PHONE || '081234567890',
      address: 'Jakarta, Indonesia',
      role: 'SUPERADMIN',
      isActive: true,
      // Data pribadi
      nik: '3171234567890001',
      birthPlace: 'Jakarta',
      birthDate: '1990-01-01',
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      occupation: 'System Administrator',
      education: 'S1',
      bloodType: 'O',
      // Kontak darurat
      emergencyContact: JSON.stringify({
        name: 'Admin Emergency',
        relation: 'Family',
        phone: '081234567891',
        address: 'Jl. Emergency No. 1, Jakarta Pusat'
      }),
      // Info bank
      bankInfo: JSON.stringify({
        bankName: 'Bank Mandiri',
        accountNumber: '1234567890',
        accountHolder: 'Super Administrator'
      }),
      // Field untuk sistem agen
      agentTierId: null,
      referralCode: null,
      totalJamaah: 0,
      totalCommission: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', { role: 'SUPERADMIN' });
  }
};
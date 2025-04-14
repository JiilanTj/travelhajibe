'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cek apakah kolom ada sebelum mengubah namanya
    const checkColumnExists = async (tableName, columnName) => {
      try {
        const query = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${tableName.toLowerCase()}' 
          AND column_name = '${columnName.toLowerCase()}'
        `;
        const [results] = await queryInterface.sequelize.query(query);
        return results.length > 0;
      } catch (error) {
        console.error(`Error checking column ${columnName} in ${tableName}:`, error);
        return false;
      }
    };

    // Users table
    if (await checkColumnExists('Users', 'is_active')) {
      await queryInterface.renameColumn('Users', 'is_active', 'isActive');
    }
    if (await checkColumnExists('Users', 'agenttierid')) {
      await queryInterface.renameColumn('Users', 'agenttierid', 'agentTierId');
    }
    if (await checkColumnExists('Users', 'referralcode')) {
      await queryInterface.renameColumn('Users', 'referralcode', 'referralCode');
    }
    if (await checkColumnExists('Users', 'totaljamaah')) {
      await queryInterface.renameColumn('Users', 'totaljamaah', 'totalJamaah');
    }
    if (await checkColumnExists('Users', 'totalcommission')) {
      await queryInterface.renameColumn('Users', 'totalcommission', 'totalCommission');
    }
    if (await checkColumnExists('Users', 'bankinfo')) {
      await queryInterface.renameColumn('Users', 'bankinfo', 'bankInfo');
    }

    // Packages table - hanya jika kolom menggunakan snake_case
    if (await checkColumnExists('Packages', 'departure_date')) {
      await queryInterface.renameColumn('Packages', 'departure_date', 'departureDate');
    }
    if (await checkColumnExists('Packages', 'remaining_quota')) {
      await queryInterface.renameColumn('Packages', 'remaining_quota', 'remainingQuota');
    }
    if (await checkColumnExists('Packages', 'additional_images')) {
      await queryInterface.renameColumn('Packages', 'additional_images', 'additionalImages');
    }
    if (await checkColumnExists('Packages', 'is_active')) {
      await queryInterface.renameColumn('Packages', 'is_active', 'isActive');
    }

    // Registrations table - hanya jika kolom menggunakan snake_case
    if (await checkColumnExists('Registrations', 'user_id')) {
      await queryInterface.renameColumn('Registrations', 'user_id', 'userId');
    }
    if (await checkColumnExists('Registrations', 'package_id')) {
      await queryInterface.renameColumn('Registrations', 'package_id', 'packageId');
    }
    if (await checkColumnExists('Registrations', 'referral_code')) {
      await queryInterface.renameColumn('Registrations', 'referral_code', 'referralCode');
    }
    if (await checkColumnExists('Registrations', 'mahram_id')) {
      await queryInterface.renameColumn('Registrations', 'mahram_id', 'mahramId');
    }
    if (await checkColumnExists('Registrations', 'mahram_status')) {
      await queryInterface.renameColumn('Registrations', 'mahram_status', 'mahramStatus');
    }
    if (await checkColumnExists('Registrations', 'room_type')) {
      await queryInterface.renameColumn('Registrations', 'room_type', 'roomType');
    }
    if (await checkColumnExists('Registrations', 'room_preferences')) {
      await queryInterface.renameColumn('Registrations', 'room_preferences', 'roomPreferences');
    }
    if (await checkColumnExists('Registrations', 'room_mate')) {
      await queryInterface.renameColumn('Registrations', 'room_mate', 'roomMate');
    }
    if (await checkColumnExists('Registrations', 'special_requests')) {
      await queryInterface.renameColumn('Registrations', 'special_requests', 'specialRequests');
    }

    // Commissions table - hanya jika kolom menggunakan snake_case
    if (await checkColumnExists('Commissions', 'agent_id')) {
      await queryInterface.renameColumn('Commissions', 'agent_id', 'agentId');
    }
    if (await checkColumnExists('Commissions', 'registration_id')) {
      await queryInterface.renameColumn('Commissions', 'registration_id', 'registrationId');
    }
    if (await checkColumnExists('Commissions', 'package_price')) {
      await queryInterface.renameColumn('Commissions', 'package_price', 'packagePrice');
    }
    if (await checkColumnExists('Commissions', 'commission_rate')) {
      await queryInterface.renameColumn('Commissions', 'commission_rate', 'commissionRate');
    }
    if (await checkColumnExists('Commissions', 'commission_amount')) {
      await queryInterface.renameColumn('Commissions', 'commission_amount', 'commissionAmount');
    }
    if (await checkColumnExists('Commissions', 'paid_at')) {
      await queryInterface.renameColumn('Commissions', 'paid_at', 'paidAt');
    }

    // Documents table - hanya jika kolom menggunakan snake_case
    if (await checkColumnExists('Documents', 'user_id')) {
      await queryInterface.renameColumn('Documents', 'user_id', 'userId');
    }
    if (await checkColumnExists('Documents', 'expiry_date')) {
      await queryInterface.renameColumn('Documents', 'expiry_date', 'expiryDate');
    }
    if (await checkColumnExists('Documents', 'verified_by')) {
      await queryInterface.renameColumn('Documents', 'verified_by', 'verifiedBy');
    }
    if (await checkColumnExists('Documents', 'verified_at')) {
      await queryInterface.renameColumn('Documents', 'verified_at', 'verifiedAt');
    }
    if (await checkColumnExists('Documents', 'rejection_reason')) {
      await queryInterface.renameColumn('Documents', 'rejection_reason', 'rejectionReason');
    }

    // AgentTiers table - hanya jika kolom menggunakan snake_case
    if (await checkColumnExists('AgentTiers', 'base_commission_rate')) {
      await queryInterface.renameColumn('AgentTiers', 'base_commission_rate', 'baseCommissionRate');
    }
    if (await checkColumnExists('AgentTiers', 'minimum_jamaah')) {
      await queryInterface.renameColumn('AgentTiers', 'minimum_jamaah', 'minimumJamaah');
    }
    if (await checkColumnExists('AgentTiers', 'bonus_rate')) {
      await queryInterface.renameColumn('AgentTiers', 'bonus_rate', 'bonusRate');
    }
  },

  async down(queryInterface, Sequelize) {
    // Tidak perlu implementasi down karena ini bersifat idempotent
    // (Jika kolom sudah menggunakan camelCase, migrasi ini tidak akan melakukan apa-apa)
  }
}; 
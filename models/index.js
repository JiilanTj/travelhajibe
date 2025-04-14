const sequelize = require('../config/database');
const User = require('./User');
const Package = require('./Package');
const Registration = require('./Registration');
const Commission = require('./Commission');
const AgentTier = require('./AgentTier');
const Document = require('./Document');
const Payment = require('./payment');

// Define associations dengan foreignKey yang eksplisit
User.belongsTo(AgentTier, { foreignKey: 'agentTierId' });
AgentTier.hasMany(User, { foreignKey: 'agentTierId' });

User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId' });

// Tambahkan relasi alias 'mahram' untuk Registration-User
Registration.belongsTo(User, { foreignKey: 'mahramId', as: 'mahram' });
User.hasMany(Registration, { foreignKey: 'mahramId', as: 'mahramFor' });

Registration.belongsTo(Package, { foreignKey: 'packageId' });
Package.hasMany(Registration, { foreignKey: 'packageId' });

User.hasMany(Commission, { foreignKey: 'agentId' });
Commission.belongsTo(User, { foreignKey: 'agentId' });

Registration.hasOne(Commission, { foreignKey: 'registrationId' });
Commission.belongsTo(Registration, { foreignKey: 'registrationId' });

// Tambahkan relasi antara User dan Document
User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

// Tambahkan relasi antara Registration dan Document
Registration.hasMany(Document, { foreignKey: 'registrationId' });
Document.belongsTo(Registration, { foreignKey: 'registrationId' });

// Tambahkan relasi antara Registration dan Payment
Registration.hasMany(Payment, { foreignKey: 'registrationId' });
Payment.belongsTo(Registration, { foreignKey: 'registrationId' });

// Tambahkan relasi antara User (admin) dan Payment
User.hasMany(Payment, { foreignKey: 'verifiedBy', as: 'verifiedPayments' });
Payment.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// Sync semua model
const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Package,
    Registration,
    Commission,
    AgentTier,
    Document,
    Payment,
    syncModels
}; 
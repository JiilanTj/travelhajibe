const midtransClient = require('midtrans-client');

// Buat Core API instance
const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-_xxxxxxxxxxxxxxxxxxxxxxxx',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-_xxxxxxxxxxxxxxxxxxxxxxxx'
});

// Buat Snap API instance
const snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-_xxxxxxxxxxxxxxxxxxxxxxxx',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-_xxxxxxxxxxxxxxxxxxxxxxxx'
});

module.exports = {
    coreApi,
    snap,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-_xxxxxxxxxxxxxxxxxxxxxxxx',
}; 
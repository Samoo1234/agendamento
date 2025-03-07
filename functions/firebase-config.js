const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccoutKey.json');

// Inicialização do Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;

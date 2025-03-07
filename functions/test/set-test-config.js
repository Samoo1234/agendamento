const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccoutKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function setTestConfig() {
    try {
        console.log('🟦 Configurando variáveis de teste...\n');

        // Configurar documento de controle com token
        const controlRef = admin.firestore().collection('systemControl').doc('whatsapp');
        await controlRef.set({
            token: process.env.WHATSAPP_TOKEN || 'SEU_TOKEN_AQUI',
            phoneId: '576714648854724',
            testNumber: '66999161540',
            updatedAt: admin.firestore.Timestamp.now()
        });

        console.log('✅ Configurações salvas!');
        console.log('\nPor favor, configure o token do WhatsApp:');
        console.log('firebase functions:config:set whatsapp.token="SEU_TOKEN_AQUI"');

    } catch (error) {
        console.error('🟥 Erro na configuração:', error);
    } finally {
        process.exit();
    }
}

// Executar configuração
setTestConfig();

const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccoutKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function atualizarRegistro() {
    try {
        const db = admin.firestore();
        
        // Atualizar o documento
        await db.collection('pacientes').doc('orci_benfica').update({
            cidade: 'Mantenópolis'
        });
        
        console.log('✅ Registro atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
    } finally {
        process.exit();
    }
}

// Executar a atualização
atualizarRegistro();
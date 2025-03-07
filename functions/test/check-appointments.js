const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccoutKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function listAllCollections() {
    try {
        console.log('🔍 Listando todas as coleções:\n');
        
        const db = admin.firestore();
        const collections = await db.listCollections();
        
        for (const collection of collections) {
            console.log(`\nColeção: ${collection.id}`);
            
            const snapshot = await collection.limit(5).get();
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    console.log(`\nDocumento ${doc.id}:`);
                    const data = doc.data();
                    // Filtrar apenas campos relevantes
                    const relevantData = {
                        telefone: data.telefone || data.phone || data.phoneNumber,
                        data: data.data || data.date,
                        horario: data.horario || data.time,
                        status: data.status,
                        mensagem: data.message || data.mensagem
                    };
                    console.log(JSON.stringify(relevantData, null, 2));
                });
            } else {
                console.log('(Coleção vazia)');
            }
        }
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        process.exit();
    }
}

listAllCollections();

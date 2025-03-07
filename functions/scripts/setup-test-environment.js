const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccoutKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function setupTestEnvironment() {
    try {
        console.log('🟦 Configurando ambiente de teste...\n');

        // 1. Criar documento de controle
        const controlRef = admin.firestore().collection('systemControl').doc('memory');
        await controlRef.set({
            phase: 'test',
            testNumber: '66999161540', // Seu número
            enabled: false,
            updatedAt: admin.firestore.Timestamp.now(),
            environment: 'test'
        });
        console.log('✅ Documento de controle criado');

        // 2. Criar coleção de memória
        const memoriesRef = admin.firestore().collection('chatMemories');
        await memoriesRef.doc('test').set({
            lastCheck: admin.firestore.Timestamp.now(),
            status: 'ready'
        });
        console.log('✅ Coleção de memória inicializada');

        // 3. Criar regras de índice
        // Nota: Índices são criados automaticamente no primeiro uso

        console.log('\n🟩 Ambiente de teste configurado com sucesso!');
        console.log('\nPróximos passos:');
        console.log('1. Fazer deploy das funções');
        console.log('2. Testar webhook com número de teste');
        console.log('3. Monitorar logs para erros');

    } catch (error) {
        console.error('🟥 Erro na configuração:', error);
    } finally {
        process.exit();
    }
}

// Executar setup
setupTestEnvironment();

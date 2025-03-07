const admin = require('../firebase-config');

async function testDatabaseAccess() {
    try {
        console.log('🔍 Testando acesso ao Firestore...');
        
        // Listar todas as coleções
        console.log('📚 Listando coleções...');
        const collections = await admin.firestore().listCollections();
        console.log('Coleções encontradas:', collections.map(col => col.id));

        // Tentar acessar a coleção agendamentos
        console.log('\n📅 Testando acesso à coleção agendamentos...');
        const agendamentosRef = admin.firestore().collection('agendamentos');
        const snapshot = await agendamentosRef.limit(1).get();
        
        if (snapshot.empty) {
            console.log('❌ Nenhum agendamento encontrado');
        } else {
            console.log('✅ Agendamento encontrado:');
            snapshot.forEach(doc => {
                console.log('ID:', doc.id);
                console.log('Dados:', doc.data());
            });
        }

        // Tentar uma consulta específica
        console.log('\n🔎 Testando consulta por nome...');
        const querySnapshot = await agendamentosRef
            .where('nome', '==', 'Samoel')
            .get();

        if (querySnapshot.empty) {
            console.log('❌ Nenhum agendamento encontrado para Samoel');
        } else {
            console.log('✅ Agendamentos de Samoel:');
            querySnapshot.forEach(doc => {
                console.log('ID:', doc.id);
                console.log('Dados:', doc.data());
            });
        }

    } catch (error) {
        console.error('🟥 Erro ao acessar o banco de dados:', error);
        console.error('Stack:', error.stack);
    }
}

// Executar o teste
testDatabaseAccess()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

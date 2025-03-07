const admin = require('../firebase-config');
const { normalizePhoneNumber } = require('../src/utils/phoneNumberUtils');

async function testSpecificNumber() {
    try {
        const telefone = '556699161540';
        console.log('🔍 Testando busca para:', telefone);

        // 1. Listar todas as coleções
        console.log('\n📚 Verificando coleções...');
        const collections = await admin.firestore().listCollections();
        console.log('Coleções encontradas:', collections.map(col => col.id));

        // 2. Verificar a coleção de agendamentos
        console.log('\n📅 Verificando coleção agendamentos...');
        const agendamentosRef = admin.firestore().collection('agendamentos');
        
        // 3. Buscar todos os agendamentos pendentes
        console.log('\n🔎 Buscando agendamentos pendentes...');
        const snapshot = await agendamentosRef
            .where('status', '==', 'pendente')
            .orderBy('data', 'asc')
            .get();

        console.log(`Encontrados ${snapshot.size} agendamentos pendentes`);

        // 4. Verificar cada documento
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('\n📋 Agendamento:', doc.id);
            console.log('Telefone original:', data.telefone);
            console.log('Telefone normalizado:', normalizePhoneNumber(data.telefone));
            console.log('Nome:', data.nome);
            console.log('Data:', data.data);
            console.log('Horário:', data.horario);
            console.log('Status:', data.status);
        });

        // 5. Buscar especificamente pelo número
        console.log('\n🎯 Buscando diretamente pelo número:', telefone);
        const directQuery = await agendamentosRef
            .where('telefone', '==', telefone)
            .get();

        console.log(`Encontrados ${directQuery.size} agendamentos diretos`);
        
        if (!directQuery.empty) {
            directQuery.forEach(doc => {
                console.log('Agendamento encontrado:', doc.data());
            });
        }

    } catch (error) {
        console.error('🟥 Erro:', error);
        console.error('Stack:', error.stack);
    }
}

// Executar
testSpecificNumber()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

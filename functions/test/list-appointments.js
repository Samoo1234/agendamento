const admin = require('../firebase-config');

async function listAppointments() {
    try {
        console.log('📅 Listando todos os agendamentos...');
        const snapshot = await admin.firestore().collection('agendamentos').get();
        
        if (snapshot.empty) {
            console.log('❌ Nenhum agendamento encontrado na coleção');
            return;
        }

        console.log(`✅ Encontrados ${snapshot.size} agendamentos:`);
        snapshot.forEach(doc => {
            console.log('\n📋 Agendamento:', doc.id);
            const data = doc.data();
            Object.entries(data).forEach(([key, value]) => {
                console.log(`${key}:`, value);
            });
        });

    } catch (error) {
        console.error('🟥 Erro:', error);
    }
}

// Executar
listAppointments()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

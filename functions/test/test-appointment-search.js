const logger = require('../src/conversationLogger');

async function testSearch() {
    // Array de números para testar
    const phones = [
        '27999999999',  // Formato simples
        '+5527999999999', // Formato internacional
        '(27)99999-9999', // Formato brasileiro
        '027999999999',   // Com zero
        '999999999'       // Só o número
    ];

    console.log('🔍 Testando busca de agendamentos...\n');

    for (const phone of phones) {
        console.log(`\n📱 Testando número: ${phone}`);
        const result = await logger.getContext(phone);
        
        console.log('Mensagens encontradas:', result.messages.length);
        console.log('Agendamentos encontrados:', result.appointments.length);
        
        if (result.appointments.length > 0) {
            console.log('\n📅 Detalhes dos agendamentos:');
            result.appointments.forEach((app, index) => {
                console.log(`\n${index + 1}. Agendamento:`);
                console.log('   Nome:', app.nome);
                console.log('   Data:', app.data);
                console.log('   Horário:', app.horario);
                console.log('   Telefone:', app.telefone);
                console.log('   Cidade:', app.cidade);
            });
        }
        
        console.log('\n-----------------------------------');
    }
}

// Executar o teste
testSearch()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

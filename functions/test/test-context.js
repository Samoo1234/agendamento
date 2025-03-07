const logger = require('../src/conversationLogger');

async function testContext() {
    try {
        console.log('🔍 Testando consulta de contexto...\n');

        // Testar com diferentes formatos
        const phones = [
            '556699161540',
            '+5566999161540',
            '66991615407',
            '(66)99161-1540'
        ];

        for (const phone of phones) {
            console.log(`\n📱 Testando número: ${phone}`);
            const context = await logger.getContext(phone);
            
            console.log('\nMensagens encontradas:', context.messages.length);
            console.log('Agendamentos encontrados:', context.appointments.length);
            
            if (context.appointments.length > 0) {
                console.log('\nAgendamentos:');
                context.appointments.forEach(app => {
                    console.log(`- Data: ${app.data}, Horário: ${app.horario}, Status: ${app.status}`);
                });
            }
        }

        console.log('\n✅ Teste concluído!');
    } catch (error) {
        console.error('🟥 Erro:', error);
    } finally {
        process.exit();
    }
}

testContext();

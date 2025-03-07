const logger = require('../src/conversationLogger');

async function testLogger() {
    try {
        console.log('🟦 Testando sistema de registro de conversas...\n');

        const phoneNumber = "556699161540";
        const testMessage = "Olá, gostaria de saber o horário de funcionamento";

        // Registrar mensagem de teste
        console.log('Salvando mensagem de teste...');
        await logger.logMessage({
            phoneNumber,
            message: testMessage,
            direction: 'received'
        });

        // Consultar mensagens
        console.log('\nConsultando mensagens salvas...');
        const messages = await logger.getMessages(phoneNumber);
        console.log('Mensagens encontradas:', JSON.stringify(messages, null, 2));

        console.log('\n✅ Teste concluído com sucesso!');

    } catch (error) {
        console.error('🟥 Erro durante o teste:', error);
    }
}

// Executar teste
testLogger();

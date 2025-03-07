const admin = require('../firebase-config');
const openaiService = require('../src/openaiServiceWithMemory');

async function testarWebhookMemory() {
    try {
        console.log(' Iniciando teste do webhook com memória...');
        
        const telefone = '5566999161540';
        const mensagem = 'verificar meus agendamentos';

        console.log(` Simulando mensagem de ${telefone}: "${mensagem}"`);
        
        const resposta = await openaiService.processMessage(telefone, mensagem, true);
        
        console.log('\n Resposta do webhook:', resposta);

    } catch (error) {
        console.error(' Erro no teste:', error);
    }
}

// Executar teste
testarWebhookMemory()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

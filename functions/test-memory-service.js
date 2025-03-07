// Script para testar o sistema de memória de forma isolada
const admin = require('./firebase-config');
const memoryService = require('./memoryService');

// Inicialização do Firebase (apenas se não estiver inicializado)
if (!admin.apps.length) {
    admin.initializeApp();
}

// Configuração do ambiente de teste
const testPhoneNumber = "66999161540";
const testMessages = [
    { content: "Olá, gostaria de agendar uma consulta", role: "user" },
    { content: "Claro! Posso ajudar com isso. Qual horário você prefere?", role: "assistant" },
    { content: "Amanhã pela manhã", role: "user" }
];

// Função principal de teste
async function runMemoryTests() {
    try {
        console.log('🟦 Iniciando testes do sistema de memória...');

        // 1. Ativar o sistema de memória
        console.log('\n1. Ativando sistema de memória...');
        memoryService.setEnabled(true);
        console.log('✅ Sistema de memória ativado');

        // 2. Salvar mensagens de teste
        console.log('\n2. Salvando mensagens de teste...');
        for (const msg of testMessages) {
            await memoryService.saveInteraction(testPhoneNumber, msg.content, msg.role);
            console.log(`✅ Mensagem salva: ${msg.content}`);
        }

        // 3. Recuperar contexto
        console.log('\n3. Recuperando contexto...');
        const context = await memoryService.getRecentContext(testPhoneNumber);
        console.log('✅ Contexto recuperado:', context);

        // 4. Testar limpeza de mensagens
        console.log('\n4. Testando limpeza de mensagens...');
        await memoryService.cleanOldMessages(testPhoneNumber, 2);
        const contextAfterClean = await memoryService.getRecentContext(testPhoneNumber);
        console.log('✅ Contexto após limpeza:', contextAfterClean);

        console.log('\n🟩 Todos os testes completados com sucesso!');

    } catch (error) {
        console.error('\n🟥 Erro durante os testes:', error);
    }
}

// Executar testes
runMemoryTests()
    .then(() => {
        console.log('\nTestes finalizados.');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

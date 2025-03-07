const functions = require('firebase-functions');
const memoryService = require('../memoryService');

// Feature flag para controle do sistema de memória
const MEMORY_ENABLED = false;

async function processMessage(phoneNumber, message) {
    try {
        // Se o sistema de memória estiver ativado, salva a mensagem
        if (MEMORY_ENABLED) {
            await memoryService.saveInteraction(phoneNumber, message, 'user');
            
            // Recupera o contexto recente
            const context = await memoryService.getRecentContext(phoneNumber);
            console.log('Contexto recuperado para', phoneNumber, ':', context);
            
            // Aqui você pode usar o contexto para melhorar a resposta da OpenAI
            // Por enquanto, vamos apenas registrar que temos o contexto
        }

        // Processa a mensagem normalmente
        // TODO: Integrar com o serviço OpenAI existente
        const response = "Estamos testando o novo sistema de memória. Em breve teremos respostas mais contextualizadas!";

        // Se o sistema de memória estiver ativado, salva a resposta
        if (MEMORY_ENABLED) {
            await memoryService.saveInteraction(phoneNumber, response, 'assistant');
            
            // Limpa mensagens antigas periodicamente
            await memoryService.cleanOldMessages(phoneNumber);
        }

        return response;
    } catch (error) {
        console.error('Erro ao processar mensagem com memória:', error);
        throw error;
    }
}

module.exports = {
    processMessage,
    // Expõe a configuração para testes
    setMemoryEnabled: (enabled) => {
        console.log(`Sistema de memória ${enabled ? 'ativado' : 'desativado'}`);
        MEMORY_ENABLED = enabled;
        memoryService.setEnabled(enabled);
    }
};

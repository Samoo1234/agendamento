// AMBIENTE DE TESTE - Não afeta o sistema em produção
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const memoryService = require('./memoryService');

// Inicialização do Firebase apenas se ainda não estiver inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}

// Feature flag para controle de segurança
const MEMORY_SYSTEM_ENABLED = true; // Ativando o sistema de memória

exports.whatsAppWebhookWithMemory = functions.https.onRequest(async (req, res) => {
    // Configurar estado do sistema de memória
    memoryService.setEnabled(MEMORY_SYSTEM_ENABLED);

    // Log de entrada para debugging
    console.log('Teste - Nova função recebeu requisição:', req.method);
    
    // Verificação de método
    if (req.method === 'GET') {
        // Apenas log, sem modificar a verificação atual
        console.log('Teste - Requisição GET recebida');
        res.status(200).send('Ambiente de teste - OK');
        return;
    }

    if (req.method === 'POST') {
        try {
            // Log da mensagem recebida
            console.log('Teste - Mensagem recebida:', JSON.stringify(req.body));
            
            if (MEMORY_SYSTEM_ENABLED) {
                // Extrair número do telefone e mensagem (ajustar conforme estrutura real)
                const phoneNumber = req.body.from || 'unknown';
                const message = req.body.text || '';

                // Salvar interação
                await memoryService.saveInteraction(phoneNumber, message);

                // Recuperar contexto recente
                const context = await memoryService.getRecentContext(phoneNumber);
                console.log('Contexto recuperado:', context);

                // Limpar mensagens antigas periodicamente
                await memoryService.cleanOldMessages(phoneNumber);
            }
            
            // Apenas confirma recebimento sem processar
            res.status(200).send('Teste - Mensagem recebida com sucesso');
            
        } catch (error) {
            console.error('Teste - Erro:', error);
            res.status(500).send('Teste - Erro interno');
        }
    }
});

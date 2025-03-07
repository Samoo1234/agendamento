const admin = require('firebase-admin');
const mockMessages = require('./mockWhatsAppMessages');

// Inicialização do Firebase
const serviceAccount = require('../serviceAccoutKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Importar serviços após inicialização do Firebase
const memoryService = require('../memoryService');
const openaiService = require('../src/openaiServiceWithMemory');
const { whatsAppWebhookWithMemory } = require('../src/whatsAppWebhookWithMemory');

async function runIntegrationTests() {
    try {
        console.log('🟦 Iniciando testes de integração...\n');

        // ETAPA 1: Testar verificação do webhook
        console.log('1️⃣ Testando verificação do webhook...');
        const verifyReq = {
            method: mockMessages.getVerification.method,
            query: mockMessages.getVerification.query
        };
        const verifyRes = {
            status: (code) => ({
                send: (data) => {
                    console.log('Resposta da verificação:', { code, data });
                    return data;
                }
            })
        };
        
        await whatsAppWebhookWithMemory(verifyReq, verifyRes);
        console.log('✅ Verificação do webhook OK\n');

        // ETAPA 2: Testar sistema de memória
        console.log('2️⃣ Testando sistema de memória...');
        memoryService.setEnabled(true);
        console.log('✅ Sistema de memória ativado\n');

        // ETAPA 3: Simular fluxo de conversa
        console.log('3️⃣ Simulando fluxo de conversa...');
        for (const interaction of mockMessages.conversationFlow) {
            console.log(`\nProcessando mensagem: "${interaction.message}"`);
            
            // Criar requisição simulada
            const messageReq = {
                method: 'POST',
                body: {
                    object: 'whatsapp_business_account',
                    entry: [{
                        changes: [{
                            value: {
                                messages: [{
                                    from: interaction.from,
                                    type: 'text',
                                    text: { body: interaction.message }
                                }]
                            }
                        }]
                    }]
                }
            };

            const messageRes = {
                sendStatus: (code) => {
                    console.log('Status da resposta:', code);
                    return code;
                }
            };

            // Processar mensagem
            await whatsAppWebhookWithMemory(messageReq, messageRes);

            // Verificar memória
            const context = await memoryService.getRecentContext(interaction.from);
            console.log('Contexto atual:', context);
        }
        console.log('✅ Fluxo de conversa processado\n');

        // ETAPA 4: Verificar limpeza de memória
        console.log('4️⃣ Testando limpeza de memória...');
        await memoryService.cleanOldMessages('66999161540', 2);
        const finalContext = await memoryService.getRecentContext('66999161540');
        console.log('Contexto final (após limpeza):', finalContext);
        console.log('✅ Limpeza de memória OK\n');

        console.log('🟩 Todos os testes completados com sucesso!');

    } catch (error) {
        console.error('🟥 Erro durante os testes:', error);
        throw error;
    }
}

// Executar testes
runIntegrationTests()
    .then(() => {
        console.log('\nTestes finalizados.');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

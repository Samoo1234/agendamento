const axios = require('axios');

// Configurações do webhook
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhookWithMemory';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const PHONE_ID = '576714648854724';
const TEST_NUMBER = '66999161540';

async function testWebhook() {
    try {
        console.log('🟦 Iniciando teste do webhook com memória...\n');

        // 1. Testar verificação do webhook
        console.log('1️⃣ Testando verificação do webhook...');
        const verifyResponse = await axios.get(WEBHOOK_URL, {
            params: {
                'hub.mode': 'subscribe',
                'hub.verify_token': VERIFY_TOKEN,
                'hub.challenge': 'test_challenge'
            }
        });

        console.log('Resposta da verificação:', verifyResponse.data);
        console.log('✅ Verificação OK\n');

        // 2. Testar envio de mensagem
        console.log('2️⃣ Simulando mensagem do WhatsApp...');
        const messageResponse = await axios.post(WEBHOOK_URL, {
            object: 'whatsapp_business_account',
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: TEST_NUMBER,
                            type: 'text',
                            text: {
                                body: 'Olá, gostaria de agendar uma consulta para amanhã'
                            }
                        }]
                    }
                }]
            }]
        });

        console.log('Status da resposta:', messageResponse.status);
        console.log('✅ Mensagem processada\n');

        console.log('🟩 Teste concluído com sucesso!');
        console.log('\nPróximos passos:');
        console.log('1. Verificar logs no Firebase Console');
        console.log('2. Verificar coleção chatMemories no Firestore');
        console.log('3. Confirmar se a memória foi salva corretamente');

    } catch (error) {
        console.error('🟥 Erro durante o teste:', error.response?.data || error.message);
    }
}

// Executar teste
testWebhook();

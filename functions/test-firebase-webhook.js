/**
 * Script para testar o webhook implantado no Firebase
 */
const axios = require('axios');

// Configurações
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';

// Função para verificar o webhook
async function verificarWebhook() {
  try {
    console.log('\n=== VERIFICANDO WEBHOOK DO FIREBASE ===');
    console.log('URL:', WEBHOOK_URL);
    
    // Simular a verificação do Facebook
    const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test_challenge`;
    
    const response = await axios.get(url);
    console.log('\nResposta:', response.data);
    
    if (response.data === 'test_challenge') {
      console.log('✅ Webhook verificado com sucesso!');
    } else {
      console.log('❌ Resposta inesperada do webhook');
    }
  } catch (error) {
    console.error('\n❌ Erro ao verificar webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Erro:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Função para testar o envio de mensagem
async function testarMensagem() {
  try {
    console.log('\n=== TESTANDO ENVIO DE MENSAGEM ===');
    
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '576714648854724',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5566999161540',
              phone_number_id: '576714648854724'
            },
            contacts: [{
              profile: {
                name: 'Teste Webhook'
              },
              wa_id: '5566999161540'
            }],
            messages: [{
              from: '5566999161540',
              id: 'wamid.test' + Date.now(),
              timestamp: Math.floor(Date.now() / 1000),
              text: {
                body: 'Olá, qual o horário de funcionamento?'
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    const response = await axios.post(WEBHOOK_URL, payload);
    console.log('\nResposta:', response.data);
    console.log('✅ Mensagem enviada com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro ao enviar mensagem:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Erro:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar os testes
async function executarTestes() {
  // 1. Verificar o webhook
  await verificarWebhook();
  
  // 2. Testar envio de mensagem
  await testarMensagem();
}

executarTestes();

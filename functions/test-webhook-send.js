/**
 * Script para testar o envio de mensagens para o webhook
 * Este script simula uma mensagem vinda do WhatsApp
 */
const axios = require('axios');

// Configurações
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

// Função para simular uma mensagem
async function simularMensagem() {
  try {
    console.log('\n=== SIMULANDO MENSAGEM DO WHATSAPP ===');
    console.log('URL do webhook:', WEBHOOK_URL);
    
    // Criar payload da mensagem
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
    
    console.log('\nEnviando payload:', JSON.stringify(payload, null, 2));
    
    // Enviar requisição
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\nResposta do webhook:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro ao enviar mensagem:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar o teste
simularMensagem();

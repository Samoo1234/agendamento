/**
 * Script para configurar o webhook do WhatsApp para apontar para a URL do Ngrok
 * 
 * IMPORTANTE: Atualize a URL do Ngrok antes de executar este script!
 */
const axios = require('axios');

// Configurações
const APP_ID = '1010033520468892';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';

// ATUALIZE ESTA URL com a URL fornecida pelo Ngrok (ex: https://abcd1234.ngrok.io)
const NGROK_URL = 'ATUALIZE_COM_SUA_URL_NGROK';

// Função para configurar o webhook
async function configurarWebhook() {
  console.log('=== CONFIGURAÇÃO DE WEBHOOK DO WHATSAPP PARA NGROK ===');
  console.log('URL do Ngrok:', NGROK_URL);
  
  if (NGROK_URL === 'ATUALIZE_COM_SUA_URL_NGROK') {
    console.error('⚠️ ERRO: Você precisa atualizar a URL do Ngrok no script!');
    console.log('Abra este arquivo (configurar-webhook-ngrok.js) e atualize a constante NGROK_URL.');
    return;
  }
  
  try {
    const url = `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions`;
    
    const data = {
      object: 'whatsapp_business_account',
      callback_url: NGROK_URL,
      verify_token: VERIFY_TOKEN,
      fields: ['messages', 'message_deliveries']
    };
    
    const config = {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Enviando solicitação para configurar webhook...');
    const response = await axios.post(url, data, config);
    
    console.log('Resposta:', response.data);
    console.log('✅ Webhook configurado com sucesso!');
    console.log('URL do webhook:', NGROK_URL);
    console.log('Token de verificação:', VERIFY_TOKEN);
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
  }
}

// Executar a função
configurarWebhook();

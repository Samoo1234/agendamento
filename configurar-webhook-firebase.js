/**
 * Script para configurar o webhook do WhatsApp para apontar para o Firebase Functions
 */
const axios = require('axios');

// Configurações
const APP_ID = '1010033520468892';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const FIREBASE_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

async function configurarWebhook() {
  try {
    console.log('=== CONFIGURAÇÃO DE WEBHOOK DO WHATSAPP PARA FIREBASE ===');
    console.log('URL do Firebase:', FIREBASE_URL);
    console.log('Token de verificação:', VERIFY_TOKEN);
    
    // Configurar o webhook
    try {
      console.log('\nMétodo 1: Configurando webhook via API Graph...');
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions`,
        {
          object: 'whatsapp_business_account',
          callback_url: FIREBASE_URL,
          verify_token: VERIFY_TOKEN,
          fields: ['messages', 'message_deliveries', 'messaging_postbacks']
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resposta da API:', response.status, response.statusText);
      console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.success) {
        console.log('\n✅ Webhook configurado com sucesso!');
      } else {
        console.log('\n⚠️ Resposta não confirmou sucesso, tentando método alternativo...');
        throw new Error('Resposta não confirmou sucesso');
      }
    } catch (error) {
      console.error('\n⚠️ Erro no Método 1:', error.message);
      
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Tentar método alternativo
      console.log('\nMétodo 2: Configurando webhook via API alternativa...');
      
      try {
        const altResponse = await axios.post(
          `https://graph.facebook.com/v21.0/2887557674896481/webhooks`,
          {
            url: FIREBASE_URL,
            verify_token: VERIFY_TOKEN,
            fields: ['messages', 'message_deliveries', 'messaging_postbacks']
          },
          {
            headers: {
              'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Resposta da API (método alternativo):', altResponse.status, altResponse.statusText);
        console.log('Dados da resposta:', JSON.stringify(altResponse.data, null, 2));
        
        console.log('\n✅ Webhook configurado com sucesso (método alternativo)!');
      } catch (altError) {
        console.error('\n❌ Erro no Método 2:', altError.message);
        
        if (altError.response) {
          console.error('Status do erro:', altError.response.status);
          console.error('Dados do erro:', JSON.stringify(altError.response.data, null, 2));
        }
        
        // Tentar terceiro método
        console.log('\nMétodo 3: Configurando webhook via API de webhook...');
        
        try {
          const thirdResponse = await axios.post(
            `https://graph.facebook.com/v21.0/576714648854724/subscribed_apps`,
            {
              access_token: WHATSAPP_TOKEN
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Resposta da API (método 3):', thirdResponse.status, thirdResponse.statusText);
          console.log('Dados da resposta:', JSON.stringify(thirdResponse.data, null, 2));
          
          console.log('\n✅ Aplicativo inscrito com sucesso (método 3)!');
          console.log('\n⚠️ Importante: Você ainda precisa configurar a URL do webhook no painel do WhatsApp Business.');
          console.log(`URL do webhook: ${FIREBASE_URL}`);
          console.log(`Token de verificação: ${VERIFY_TOKEN}`);
        } catch (thirdError) {
          console.error('\n❌ Erro no Método 3:', thirdError.message);
          
          if (thirdError.response) {
            console.error('Status do erro:', thirdError.response.status);
            console.error('Dados do erro:', JSON.stringify(thirdError.response.data, null, 2));
          }
          
          console.log('\n⚠️ Todos os métodos automáticos falharam. Configure manualmente o webhook no painel do WhatsApp Business:');
          console.log(`URL do webhook: ${FIREBASE_URL}`);
          console.log(`Token de verificação: ${VERIFY_TOKEN}`);
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

// Executar a configuração
configurarWebhook();

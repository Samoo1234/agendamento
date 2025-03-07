/**
 * Script para configurar o webhook do WhatsApp automaticamente
 * Este script configura o webhook do WhatsApp para apontar para uma URL fixa
 */
const axios = require('axios');

// Configurações fixas
const APP_ID = '1010033520468892';
const VERIFY_TOKEN = 'oticadavi2024';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const PHONE_ID = '576714648854724';

// URL fixa para o webhook (use uma URL pública válida)
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

async function configurarWebhookAutomatico() {
  try {
    console.log('=== CONFIGURAÇÃO AUTOMÁTICA DE WEBHOOK DO WHATSAPP ===');
    console.log('URL do webhook:', WEBHOOK_URL);
    console.log('Token de verificação:', VERIFY_TOKEN);
    
    // Método 1: Configurar webhook via API Graph
    try {
      console.log('\nMétodo 1: Configurando webhook via API Graph...');
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions`,
        {
          object: 'whatsapp_business_account',
          callback_url: WEBHOOK_URL,
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
      
      // Método 2: Configurar webhook via API alternativa
      try {
        console.log('\nMétodo 2: Configurando webhook via API alternativa...');
        const altResponse = await axios.post(
          `https://graph.facebook.com/v21.0/2887557674896481/webhooks`,
          {
            url: WEBHOOK_URL,
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
        
        // Método 3: Inscrever aplicativo
        try {
          console.log('\nMétodo 3: Inscrevendo aplicativo...');
          const thirdResponse = await axios.post(
            `https://graph.facebook.com/v21.0/${PHONE_ID}/subscribed_apps`,
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
        } catch (thirdError) {
          console.error('\n❌ Erro no Método 3:', thirdError.message);
          
          if (thirdError.response) {
            console.error('Status do erro:', thirdError.response.status);
            console.error('Dados do erro:', JSON.stringify(thirdError.response.data, null, 2));
          }
        }
      }
    }
    
    // Verificar configuração atual do webhook
    try {
      console.log('\nVerificando configuração atual do webhook...');
      const getResponse = await axios.get(
        `https://graph.facebook.com/v21.0/${PHONE_ID}/webhooks`,
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`
          }
        }
      );
      
      console.log('Configuração atual do webhook:', JSON.stringify(getResponse.data, null, 2));
    } catch (getError) {
      console.error('\n❌ Erro ao verificar configuração atual:', getError.message);
      
      if (getError.response) {
        console.error('Status do erro:', getError.response.status);
        console.error('Dados do erro:', JSON.stringify(getError.response.data, null, 2));
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

// Executar a configuração
configurarWebhookAutomatico();

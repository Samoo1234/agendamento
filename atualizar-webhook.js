const axios = require('axios');

// Configurações
const appId = '602469032585407';
const apiVersion = 'v21.0';
const webhookUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook'; // Atualizando para o nome correto da função
const verifyToken = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const appAccessToken = '602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c';
const whatsappBusinessAccountId = '2887557674896481';

// Função para atualizar a configuração do webhook
async function atualizarWebhook() {
  try {
    console.log('Atualizando configuração do webhook...');
    
    const url = `https://graph.facebook.com/${apiVersion}/${appId}/subscriptions`;
    
    const headers = {
      'Authorization': `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json'
    };
    
    const data = {
      object: 'whatsapp_business_account',
      callback_url: webhookUrl,
      verify_token: verifyToken,
      fields: ['messages', 'message_deliveries', 'messaging_postbacks', 'message_reads', 'message_reactions']
    };
    
    console.log('URL:', url);
    console.log('Dados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(url, data, { headers });
    
    console.log('Resposta da atualização:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200 && response.data.success === true) {
      console.log('✅ Webhook atualizado com sucesso!');
    } else {
      console.log('❌ Falha na atualização do webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
atualizarWebhook();

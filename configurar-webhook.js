const axios = require('axios');

// Configurações
const appId = '602469032585407';
const apiVersion = 'v21.0';
const webhookUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsappWebhookHandler';
const verifyToken = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const appAccessToken = '602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c';
const whatsappBusinessAccountId = '2887557674896481'; // ID da conta do WhatsApp Business

// Função para subscrever o aplicativo aos webhooks da conta do WhatsApp Business
async function subscribeAppToWebhooks() {
  try {
    console.log('Subscrevendo o aplicativo aos webhooks da conta do WhatsApp Business...');
    
    const url = `https://graph.facebook.com/${apiVersion}/${whatsappBusinessAccountId}/subscribed_apps`;
    
    const headers = {
      'Authorization': `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('URL:', url);
    
    const response = await axios.post(url, {}, { headers });
    
    console.log('Resposta da subscrição:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200 && response.data.success === "true") {
      console.log('✅ Aplicativo subscrito com sucesso aos webhooks da conta do WhatsApp Business!');
    } else {
      console.log('❌ Falha na subscrição do aplicativo');
    }
  } catch (error) {
    console.error('❌ Erro ao subscrever o aplicativo aos webhooks:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
subscribeAppToWebhooks();

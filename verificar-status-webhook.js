const axios = require('axios');

// Configurações
const appId = '602469032585407';
const apiVersion = 'v21.0';
const appAccessToken = '602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c';
const whatsappBusinessAccountId = '2887557674896481';

async function verificarStatusWebhook() {
  try {
    console.log('Verificando status do webhook...');
    
    // URL para verificar o status do webhook
    const url = `https://graph.facebook.com/${apiVersion}/${whatsappBusinessAccountId}/webhooks`;
    
    const headers = {
      'Authorization': `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('URL:', url);
    
    const response = await axios.get(url, { headers });
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Webhook configurado com sucesso!');
      
      // Verificar campos inscritos
      const fields = response.data.data[0].fields || [];
      console.log('Campos inscritos:', fields.join(', '));
    } else {
      console.log('❌ Webhook não encontrado ou não configurado corretamente');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status do webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Executar
verificarStatusWebhook();

const axios = require('axios');

// Configurações
const appId = '602469032585407';
const apiVersion = 'v21.0';
const appAccessToken = '602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c';

async function verificarApp() {
  try {
    console.log('Verificando informações do aplicativo...');
    
    const url = `https://graph.facebook.com/${apiVersion}/${appId}`;
    
    const headers = {
      'Authorization': `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('URL:', url);
    
    const response = await axios.get(url, { headers });
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao verificar aplicativo:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
verificarApp();

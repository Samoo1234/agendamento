const axios = require('axios');

// Configurações
const phoneNumberId = '576714648854724';
const apiVersion = 'v21.0';
const appAccessToken = '602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c';

async function verificarNumero() {
  try {
    console.log('Verificando informações do número de telefone...');
    
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`;
    
    const headers = {
      'Authorization': `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('URL:', url);
    
    const response = await axios.get(url, { headers });
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
    // Se houver um campo waba_id, vamos mostrar
    if (response.data.waba_id) {
      console.log('\nID da Conta do WhatsApp Business (WABA ID):', response.data.waba_id);
    } else if (response.data.whatsapp_business_api_data && response.data.whatsapp_business_api_data.business_account_id) {
      console.log('\nID da Conta do WhatsApp Business (business_account_id):', 
        response.data.whatsapp_business_api_data.business_account_id);
    } else {
      console.log('\nNão foi possível encontrar o ID da Conta do WhatsApp Business');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar número:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
verificarNumero();

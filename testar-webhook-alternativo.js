const axios = require('axios');

// Configurações
const webhookUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const verifyToken = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';

// Parâmetros de verificação do webhook
const params = {
  'hub.mode': 'subscribe',
  'hub.verify_token': verifyToken,
  'hub.challenge': 'challenge_code_123456'
};

// Função para testar o webhook diretamente
async function testarWebhookDiretamente() {
  try {
    console.log('Testando webhook alternativo com os seguintes parâmetros:');
    console.log(params);
    console.log('URL:', webhookUrl);
    
    const response = await axios.get(webhookUrl, { params });
    
    console.log('Resposta do servidor:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200 && response.data === params['hub.challenge']) {
      console.log('✅ Webhook verificado com sucesso!');
    } else {
      console.log('❌ Falha na verificação do webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao testar webhook diretamente:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar os testes
async function executarTestes() {
  console.log('=== TESTE: Verificar webhook alternativo ===');
  await testarWebhookDiretamente();
}

executarTestes();

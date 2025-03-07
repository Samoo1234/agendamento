const axios = require('axios');

// Configurações
const appId = '602469032585407';
const appSecret = '7fe868b23b66a2957eddc89212d1970a';

async function gerarTokenApp() {
  try {
    console.log('Gerando token de acesso de aplicativo...');
    
    const url = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
    
    const response = await axios.get(url);
    
    console.log('Token de acesso de aplicativo gerado com sucesso:');
    console.log(response.data);
    
    console.log('\nToken para usar na configuração do webhook:');
    console.log(response.data.access_token);
  } catch (error) {
    console.error('❌ Erro ao gerar token de acesso de aplicativo:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
gerarTokenApp();

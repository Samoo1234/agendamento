const axios = require('axios');

// URL da função de teste
const url = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/testeWebhook';

async function testarFuncao() {
  try {
    console.log('Testando função simples...');
    console.log('URL:', url);
    
    const response = await axios.get(url);
    
    console.log('Resposta do servidor:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Função de teste acessada com sucesso!');
    } else {
      console.log('❌ Falha ao acessar a função de teste');
    }
  } catch (error) {
    console.error('❌ Erro ao testar função:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar o teste
testarFuncao();

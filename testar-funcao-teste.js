const axios = require('axios');

// Configurações
const testeUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/testeWebhook';

// Função para testar a função de teste
async function testarFuncaoTeste() {
  try {
    console.log('Testando função de teste...');
    console.log('URL:', testeUrl);
    
    const response = await axios.get(testeUrl);
    
    console.log('Resposta do servidor:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Função de teste acessada com sucesso!');
    } else {
      console.log('❌ Falha ao acessar função de teste');
    }
  } catch (error) {
    console.error('❌ Erro ao testar função de teste:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
testarFuncaoTeste();

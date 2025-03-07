/**
 * Script para testar a verificação do webhook do WhatsApp
 */
const axios = require('axios');

// Configurações
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const CHALLENGE = 'teste_verificacao_' + Date.now();

// Função para testar a verificação do webhook
async function testarVerificacaoWebhook() {
  try {
    console.log(`\n=== TESTE DE VERIFICAÇÃO DO WEBHOOK ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    console.log(`Verify Token: ${VERIFY_TOKEN}`);
    console.log(`Challenge: ${CHALLENGE}`);
    
    // Construir a URL com os parâmetros de verificação
    const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${CHALLENGE}`;
    
    console.log(`\nEnviando requisição GET para o webhook...`);
    const response = await axios.get(url);
    
    console.log(`\n=== RESPOSTA DO WEBHOOK ===`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Dados da resposta: ${JSON.stringify(response.data)}`);
    
    // Verificar se a resposta contém o challenge
    if (response.data === CHALLENGE) {
      console.log(`\n✅ TESTE CONCLUÍDO COM SUCESSO!`);
      console.log(`O webhook respondeu corretamente com o challenge.`);
      console.log(`Isso indica que o webhook está configurado corretamente.`);
    } else {
      console.log(`\n❌ TESTE FALHOU!`);
      console.log(`O webhook não respondeu com o challenge esperado.`);
      console.log(`Esperado: ${CHALLENGE}`);
      console.log(`Recebido: ${response.data}`);
    }
    
  } catch (error) {
    console.error(`\n❌ ERRO AO VERIFICAR WEBHOOK`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Dados do erro: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Erro: ${error.message}`);
    }
  }
}

// Executar o teste
testarVerificacaoWebhook();

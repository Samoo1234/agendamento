/**
 * Script final para configurar o webhook do WhatsApp para apontar para o Firebase Functions
 */
const axios = require('axios');

// Configurações
const APP_ID = '1010033520468892';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const FIREBASE_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

// Função para configurar o webhook
async function configurarWebhook() {
  console.log('=== CONFIGURAÇÃO FINAL DE WEBHOOK DO WHATSAPP PARA FIREBASE ===');
  console.log('URL do Firebase:', FIREBASE_URL);
  console.log('Token de verificação:', VERIFY_TOKEN);
  
  try {
    const url = `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions`;
    
    const data = {
      object: 'whatsapp_business_account',
      callback_url: FIREBASE_URL,
      verify_token: VERIFY_TOKEN,
      fields: ['messages', 'message_deliveries']
    };
    
    const config = {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Enviando solicitação para configurar webhook...');
    const response = await axios.post(url, data, config);
    
    console.log('Resposta:', response.data);
    console.log('✅ Webhook configurado com sucesso!');
    
    // Verificar se o webhook está funcionando
    console.log('\n=== VERIFICANDO WEBHOOK ===');
    await verificarWebhook();
    
    // Testar envio de mensagem
    console.log('\n=== TESTANDO ENVIO DE MENSAGEM ===');
    await testarEnvioMensagem();
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
  }
}

// Função para verificar se o webhook está funcionando
async function verificarWebhook() {
  try {
    const url = `${FIREBASE_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=CHALLENGE_ACCEPTED`;
    
    console.log('Enviando solicitação GET para:', url);
    
    const response = await axios.get(url);
    
    console.log('Status da resposta:', response.status);
    console.log('Corpo da resposta:', response.data);
    
    if (response.status === 200 && response.data === 'CHALLENGE_ACCEPTED') {
      console.log('✅ Verificação do webhook bem-sucedida!');
    } else {
      console.log('❌ Verificação do webhook falhou!');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
  }
}

// Função para testar o envio de uma mensagem
async function testarEnvioMensagem() {
  try {
    // Solicitar número de telefone
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Digite o número de telefone para testar (com DDD, sem +55): ', async (telefone) => {
      // Formatar telefone
      if (!telefone.startsWith('55')) {
        telefone = '55' + telefone;
      }
      
      console.log(`Enviando mensagem de teste para ${telefone}...`);
      
      try {
        const url = `https://graph.facebook.com/v21.0/576714648854724/messages`;
        
        const data = {
          messaging_product: 'whatsapp',
          to: telefone,
          type: 'text',
          text: {
            body: 'Olá! Esta é uma mensagem de teste do sistema de integração WhatsApp + OpenAI da Ótica Davi. Se você recebeu esta mensagem, a configuração foi bem-sucedida!'
          }
        };
        
        const config = {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        };
        
        const response = await axios.post(url, data, config);
        
        console.log('Resposta:', response.data);
        console.log('✅ Mensagem enviada com sucesso!');
        console.log('Se tudo estiver configurado corretamente, você deve receber uma resposta no seu WhatsApp em breve.');
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.message);
        
        if (error.response) {
          console.error('Status do erro:', error.response.status);
          console.error('Dados do erro:', error.response.data);
        }
      }
      
      readline.close();
    });
  } catch (error) {
    console.error('❌ Erro ao testar envio de mensagem:', error.message);
  }
}

// Executar a função
configurarWebhook();

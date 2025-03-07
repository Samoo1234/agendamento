/**
 * Script para atualizar o webhook do WhatsApp para apontar para o servidor local
 * Certifique-se de que o Ngrok está rodando antes de executar este script
 */
require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

// Configurações
const APP_ID = process.env.WHATSAPP_APP_ID || '1010033520468892';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'oticadavi2024';

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function atualizarWebhook() {
  try {
    console.log('=== ATUALIZAÇÃO DE WEBHOOK DO WHATSAPP ===');
    
    // Solicitar URL do Ngrok
    const ngrokUrl = await new Promise(resolve => {
      rl.question('Digite a URL do Ngrok (ex: https://1234-abcd.ngrok.io): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!ngrokUrl || !ngrokUrl.startsWith('https://')) {
      console.error('URL inválida. A URL deve começar com https://');
      rl.close();
      return;
    }
    
    // Solicitar token de acesso
    const accessToken = await new Promise(resolve => {
      rl.question('Digite o token de acesso do WhatsApp Business: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!accessToken) {
      console.error('Token de acesso inválido');
      rl.close();
      return;
    }
    
    console.log('\nAtualizando webhook para:', ngrokUrl);
    console.log('Token de verificação:', VERIFY_TOKEN);
    
    // Configurar o webhook
    const webhookUrl = `${ngrokUrl}/webhook`;
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions`,
      {
        object: 'whatsapp_business_account',
        callback_url: webhookUrl,
        verify_token: VERIFY_TOKEN,
        fields: ['messages', 'message_deliveries', 'messaging_postbacks']
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\nResposta da API:', response.status, response.statusText);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.success) {
      console.log('\n✅ Webhook atualizado com sucesso!');
      console.log(`\nO webhook agora está configurado para: ${webhookUrl}`);
      console.log(`Token de verificação: ${VERIFY_TOKEN}`);
    } else {
      console.log('\n❌ Falha ao atualizar webhook');
    }
  } catch (error) {
    console.error('\n❌ Erro ao atualizar webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    rl.close();
  }
}

// Executar a atualização
atualizarWebhook();

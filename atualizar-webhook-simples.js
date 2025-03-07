/**
 * Script simplificado para atualizar o webhook do WhatsApp
 */
const axios = require('axios');
const readline = require('readline');

// Configurações fixas
const APP_ID = '1010033520468892';
const VERIFY_TOKEN = 'oticadavi2024';

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
      rl.question('Cole a URL do Ngrok (ex: https://1234-abcd.ngrok.io): ', (answer) => {
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
      rl.question('Cole o token de acesso do WhatsApp Business: ', (answer) => {
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
    
    try {
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
      
      // Tentar método alternativo
      console.log('\nTentando método alternativo...');
      
      try {
        const altResponse = await axios.post(
          `https://graph.facebook.com/v21.0/2887557674896481/webhooks`,
          {
            url: webhookUrl,
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
        
        console.log('\nResposta da API (método alternativo):', altResponse.status, altResponse.statusText);
        console.log('Dados da resposta:', JSON.stringify(altResponse.data, null, 2));
        
        console.log('\n✅ Webhook atualizado com sucesso (método alternativo)!');
      } catch (altError) {
        console.error('\n❌ Erro ao atualizar webhook (método alternativo):', altError.message);
        
        if (altError.response) {
          console.error('Status do erro:', altError.response.status);
          console.error('Dados do erro:', JSON.stringify(altError.response.data, null, 2));
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  } finally {
    rl.close();
  }
}

// Executar a atualização
atualizarWebhook();

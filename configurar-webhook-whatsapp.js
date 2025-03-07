/**
 * Script para configurar o webhook do WhatsApp
 * Este script configura o webhook do WhatsApp para apontar para a URL do Ngrok
 */
const axios = require('axios');
const readline = require('readline');

// Configurações fixas
const APP_ID = '1010033520468892';
const VERIFY_TOKEN = 'oticadavi2024';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function configurarWebhook() {
  try {
    console.log('=== CONFIGURAÇÃO DE WEBHOOK DO WHATSAPP ===');
    
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
    
    console.log('\nConfigurando webhook para:', ngrokUrl);
    console.log('Token de verificação:', VERIFY_TOKEN);
    
    // Configurar o webhook
    const webhookUrl = `${ngrokUrl}/webhook`;
    
    try {
      console.log('\nMétodo 1: Configurando webhook via API Graph...');
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
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resposta da API:', response.status, response.statusText);
      console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.success) {
        console.log('\n✅ Webhook configurado com sucesso!');
      } else {
        console.log('\n⚠️ Resposta não confirmou sucesso, tentando método alternativo...');
        throw new Error('Resposta não confirmou sucesso');
      }
    } catch (error) {
      console.error('\n⚠️ Erro no Método 1:', error.message);
      
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Tentar método alternativo
      console.log('\nMétodo 2: Configurando webhook via API alternativa...');
      
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
              'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Resposta da API (método alternativo):', altResponse.status, altResponse.statusText);
        console.log('Dados da resposta:', JSON.stringify(altResponse.data, null, 2));
        
        console.log('\n✅ Webhook configurado com sucesso (método alternativo)!');
      } catch (altError) {
        console.error('\n❌ Erro no Método 2:', altError.message);
        
        if (altError.response) {
          console.error('Status do erro:', altError.response.status);
          console.error('Dados do erro:', JSON.stringify(altError.response.data, null, 2));
        }
        
        // Tentar terceiro método
        console.log('\nMétodo 3: Configurando webhook via API de webhook...');
        
        try {
          const thirdResponse = await axios.post(
            `https://graph.facebook.com/v21.0/576714648854724/subscribed_apps`,
            {
              access_token: WHATSAPP_TOKEN
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Resposta da API (método 3):', thirdResponse.status, thirdResponse.statusText);
          console.log('Dados da resposta:', JSON.stringify(thirdResponse.data, null, 2));
          
          console.log('\n✅ Aplicativo inscrito com sucesso (método 3)!');
          console.log('\n⚠️ Importante: Você ainda precisa configurar a URL do webhook no painel do WhatsApp Business.');
          console.log(`URL do webhook: ${webhookUrl}`);
          console.log(`Token de verificação: ${VERIFY_TOKEN}`);
        } catch (thirdError) {
          console.error('\n❌ Erro no Método 3:', thirdError.message);
          
          if (thirdError.response) {
            console.error('Status do erro:', thirdError.response.status);
            console.error('Dados do erro:', JSON.stringify(thirdError.response.data, null, 2));
          }
          
          console.log('\n⚠️ Todos os métodos automáticos falharam. Configure manualmente o webhook no painel do WhatsApp Business:');
          console.log(`URL do webhook: ${webhookUrl}`);
          console.log(`Token de verificação: ${VERIFY_TOKEN}`);
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  } finally {
    rl.close();
  }
}

// Executar a configuração
configurarWebhook();

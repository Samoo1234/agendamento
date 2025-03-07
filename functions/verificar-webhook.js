/**
 * Script para verificar a configuração do webhook no WhatsApp
 */
const axios = require('axios');

// Configurações
const TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const APP_ID = '2887557674896481';
const API_VERSION = 'v21.0';

// Função para verificar a configuração do webhook
async function verificarWebhook() {
  try {
    console.log('\n=== VERIFICANDO CONFIGURAÇÃO DO WEBHOOK ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    
    console.log('\nObtendo configuração atual do webhook...');
    
    const url = `https://graph.facebook.com/${API_VERSION}/${APP_ID}/subscribed_apps`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('\n✅ CONFIGURAÇÃO ATUAL DO WEBHOOK');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Verificar campos inscritos
    console.log('\nVerificando campos inscritos...');
    
    const webhookUrl = `https://graph.facebook.com/${API_VERSION}/${APP_ID}/webhooks`;
    
    const webhookResponse = await axios.get(webhookUrl, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('\n✅ CONFIGURAÇÃO DETALHADA DO WEBHOOK');
    console.log(JSON.stringify(webhookResponse.data, null, 2));
    
    // Verificar se o webhook está configurado corretamente
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('\n✅ O webhook está configurado corretamente!');
      
      // Verificar campos inscritos
      const campos = response.data.data[0].subscribed_fields || [];
      console.log('\nCampos inscritos:');
      campos.forEach(campo => {
        console.log(`- ${campo}`);
      });
      
      // Verificar se o campo 'messages' está inscrito
      if (campos.includes('messages')) {
        console.log('\n✅ O campo "messages" está inscrito corretamente!');
      } else {
        console.log('\n❌ O campo "messages" NÃO está inscrito!');
        console.log('Isso pode causar problemas no recebimento de mensagens.');
      }
    } else {
      console.log('\n❌ O webhook NÃO está configurado corretamente!');
    }
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
  } catch (error) {
    console.error('\n❌ ERRO AO VERIFICAR WEBHOOK');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data));
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar a verificação
verificarWebhook();

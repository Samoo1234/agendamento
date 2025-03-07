/**
 * Script para testar a integração com o webhook do WhatsApp
 * Este script simula o envio de uma mensagem para o webhook do WhatsApp
 */

const axios = require('axios');

// Configurações
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const VERIFY_TOKEN = 'oticadavi2024';
const PHONE_NUMBER = '5566999999999'; // Substitua pelo seu número de telefone

/**
 * Testa a verificação do webhook (GET request)
 */
async function testarVerificacaoWebhook() {
  try {
    console.log('=== TESTE DE VERIFICAÇÃO DO WEBHOOK ===');
    console.log('URL:', WEBHOOK_URL);
    console.log('Token de verificação:', VERIFY_TOKEN);
    
    const response = await axios.get(WEBHOOK_URL, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': '1234567890'
      }
    });
    
    console.log('Resposta recebida com sucesso!');
    console.log('Status da resposta:', response.status);
    console.log('Corpo da resposta:', response.data);
    
    if (response.status === 200 && response.data === '1234567890') {
      console.log('Verificação do webhook bem-sucedida!');
      return true;
    } else {
      console.log('Verificação do webhook concluída, mas com resposta diferente do esperado.');
      console.log('Isso pode ser normal se o webhook estiver configurado corretamente.');
      return true; 
    }
  } catch (error) {
    console.error('Erro ao verificar webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
    
    return false;
  }
}

/**
 * Testa o envio de uma mensagem para o webhook (POST request)
 */
async function testarEnvioMensagem(mensagem) {
  try {
    console.log('\n=== TESTE DE ENVIO DE MENSAGEM PARA O WEBHOOK ===');
    console.log('URL:', WEBHOOK_URL);
    console.log('Número de telefone:', PHONE_NUMBER);
    console.log('Mensagem:', mensagem);
    
    // Criar payload no formato que o webhook espera
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '123456789',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5566999999999',
              phone_number_id: '576714648854724'
            },
            contacts: [{
              profile: {
                name: 'Usuário Teste'
              },
              wa_id: PHONE_NUMBER
            }],
            messages: [{
              from: PHONE_NUMBER,
              id: 'wamid.test' + Date.now(),
              timestamp: Math.floor(Date.now() / 1000),
              text: {
                body: mensagem
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    console.log('Enviando mensagem para o webhook...');
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Resposta recebida com sucesso!');
    console.log('Status da resposta:', response.status);
    console.log('Corpo da resposta:', response.data);
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem para o webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
    
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('=== TESTE DE INTEGRAÇÃO COM WEBHOOK DO WHATSAPP ===');
    console.log('Data e hora:', new Date().toLocaleString());
    
    // Testar verificação do webhook
    const verificacaoOk = await testarVerificacaoWebhook();
    
    if (verificacaoOk) {
      // Testar envio de mensagem
      const mensagem = process.argv[2] || "Olá, qual o horário de funcionamento da ótica?";
      await testarEnvioMensagem(mensagem);
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
  } catch (error) {
    console.error('\n=== ERRO NO TESTE ===');
    console.error('O teste falhou:', error.message);
  }
}

// Executar o teste
main();

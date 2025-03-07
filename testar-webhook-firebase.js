/**
 * Script para testar o webhook do Firebase
 * Simula o envio de uma mensagem "Oi" para o webhook
 */
const axios = require('axios');

// Configurações
const FIREBASE_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';

// Função para testar a verificação do webhook (GET)
async function testarVerificacaoWebhook() {
  try {
    console.log('=== TESTE DE VERIFICAÇÃO DO WEBHOOK ===');
    console.log('URL:', FIREBASE_URL);
    console.log('Token:', VERIFY_TOKEN);
    
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
    console.error('❌ Erro ao testar verificação do webhook:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
  }
}

// Função para simular o envio de uma mensagem "Oi" (POST)
async function simularMensagemOi() {
  try {
    console.log('\n=== SIMULAÇÃO DE MENSAGEM "OI" ===');
    
    // Corpo da requisição simulando uma mensagem "Oi"
    const body = {
      "object": "whatsapp_business_account",
      "entry": [
        {
          "id": "2887557674896481",
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "5566999161540",
                  "phone_number_id": "576714648854724"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "Samoel Duarte"
                    },
                    "wa_id": "556699161540"
                  }
                ],
                "messages": [
                  {
                    "from": "556699161540",
                    "id": "wamid.HBgMNTU2Njk5MTYxNTQwFQIAEhggNTM4QkI1RkE5M0MwOTlCNzJGRTc5NzNCMjFBQzI3NTEA",
                    "timestamp": "1677721357",
                    "text": {
                      "body": "Oi"
                    },
                    "type": "text"
                  }
                ]
              },
              "field": "messages"
            }
          ]
        }
      ]
    };
    
    console.log('Enviando solicitação POST para:', FIREBASE_URL);
    console.log('Corpo da requisição:', JSON.stringify(body, null, 2));
    
    const response = await axios.post(FIREBASE_URL, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Corpo da resposta:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Mensagem "Oi" enviada com sucesso!');
      console.log('Se tudo estiver funcionando corretamente, você deve receber uma resposta no seu WhatsApp em breve.');
    } else {
      console.log('❌ Falha ao enviar mensagem "Oi"!');
    }
  } catch (error) {
    console.error('❌ Erro ao simular mensagem "Oi":', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
  }
}

// Executar os testes
async function executarTestes() {
  // await testarVerificacaoWebhook();
  await simularMensagemOi();
}

executarTestes();

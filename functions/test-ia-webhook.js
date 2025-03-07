/**
 * Script para testar o webhook do WhatsApp com uma mensagem que ativa o atendimento por IA
 * 
 * Este script simula uma mensagem recebida pelo webhook que não é uma resposta de confirmação,
 * o que deve ativar o processamento por IA.
 * 
 * Uso:
 * node test-ia-webhook.js
 */

const axios = require('axios');

// Configurações
const WEBHOOK_URL = 'http://localhost:5001/oticadavi-113e0/us-central1/whatsAppWebhook';
const TELEFONE = '5511999999999'; // Substitua pelo telefone de teste

// Simula o corpo de uma mensagem do WhatsApp
const webhookBody = {
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Cliente Teste"
                },
                "wa_id": TELEFONE
              }
            ],
            "messages": [
              {
                "from": TELEFONE,
                "id": "wamid.TEST_MESSAGE_ID",
                "timestamp": Date.now().toString(),
                "text": {
                  "body": "Qual o horário de funcionamento da ótica?"
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

// Função para testar o webhook
async function testarWebhook() {
  try {
    console.log('Enviando mensagem de teste para o webhook...');
    console.log('Mensagem:', webhookBody.entry[0].changes[0].value.messages[0].text.body);
    
    const response = await axios.post(WEBHOOK_URL, webhookBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Resposta do webhook:', response.status, response.statusText);
    console.log('Dados da resposta:', response.data);
    
    console.log('\nTeste concluído com sucesso!');
    console.log('Verifique os logs do Firebase Functions para ver o processamento completo.');
  } catch (error) {
    console.error('Erro ao testar webhook:', error.response?.data || error.message);
  }
}

// Executar o teste
testarWebhook();

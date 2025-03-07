const axios = require('axios');

// Configurações
const webhookUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

// Simular uma requisição POST do WhatsApp para o webhook
async function simularRequisicaoWebhook() {
  try {
    console.log('Simulando requisição do WhatsApp para o webhook...');
    
    // Dados simulados de uma mensagem do WhatsApp
    const data = {
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
                      "name": "Teste Webhook"
                    },
                    "wa_id": "5566999161540"
                  }
                ],
                "messages": [
                  {
                    "from": "5566999161540",
                    "id": "wamid.test123456789",
                    "timestamp": Date.now().toString(),
                    "text": {
                      "body": "sim"
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
    
    console.log('URL:', webhookUrl);
    console.log('Dados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(webhookUrl, data);
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200) {
      console.log('✅ Webhook processou a requisição com sucesso!');
    } else {
      console.log('❌ Falha ao processar a requisição do webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao simular requisição do webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
simularRequisicaoWebhook();

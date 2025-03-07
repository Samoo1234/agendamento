/**
 * Script para testar o webhook completo
 * Simula uma mensagem recebida do WhatsApp exatamente como a Meta envia
 */
const axios = require('axios');

// Configurações
const TELEFONE = '66999161540'; // Seu número
const MENSAGEM = 'TESTE FINAL: Qual o horário de funcionamento da ótica?';
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

// Função para simular uma mensagem recebida
async function simularMensagemRecebida() {
  try {
    console.log(`\n=== SIMULAÇÃO DE MENSAGEM RECEBIDA DO WHATSAPP ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Telefone: ${TELEFONE}`);
    console.log(`Mensagem: "${MENSAGEM}"`);
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    
    // Formatar o número para o formato esperado pelo webhook (sem o 55)
    let numeroFormatado = TELEFONE;
    if (numeroFormatado.startsWith('55')) {
      numeroFormatado = numeroFormatado.substring(2);
    }
    
    // Criar o payload que simula uma mensagem recebida do WhatsApp
    // Formato exato que o WhatsApp envia para o webhook
    const payload = {
      "object": "whatsapp_business_account",
      "entry": [
        {
          "id": "2887557674896481",
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "556692582862",
                  "phone_number_id": "576714648854724"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "Usuário de Teste"
                    },
                    "wa_id": numeroFormatado
                  }
                ],
                "messages": [
                  {
                    "from": numeroFormatado,
                    "id": `wamid.${Date.now()}`,
                    "timestamp": Math.floor(Date.now() / 1000),
                    "text": {
                      "body": MENSAGEM
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
    
    console.log('\nPayload completo:');
    console.log(JSON.stringify(payload, null, 2));
    
    console.log('\nEnviando requisição para o webhook...');
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== RESPOSTA DO WEBHOOK ===');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Dados da resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('A mensagem foi enviada para o webhook.');
    console.log('Verifique seu celular para confirmar se recebeu a resposta.');
    console.log('Verifique também os logs do Firebase para mais detalhes.');
    
  } catch (error) {
    console.error('\n❌ ERRO AO SIMULAR MENSAGEM');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Erro: ${error.message}`);
    }
  }
}

// Executar a simulação
simularMensagemRecebida();

/**
 * Script para testar o webhook do WhatsApp diretamente
 * Simula uma requisição como se fosse enviada pelo WhatsApp Business API
 */
const axios = require('axios');

// Configuração
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

// Função para simular uma mensagem recebida
async function simularMensagemRecebida(telefone, texto) {
  console.log(`\n=== SIMULANDO MENSAGEM RECEBIDA ===`);
  console.log(`Telefone: ${telefone}`);
  console.log(`Texto: "${texto}"`);
  
  // Criar payload no formato que o WhatsApp envia
  const payload = {
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "123456789",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "5566996151550",
                "phone_number_id": "576714648854724"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "Cliente Teste"
                  },
                  "wa_id": telefone
                }
              ],
              "messages": [
                {
                  "from": telefone,
                  "id": "wamid.ABC123" + Date.now(),
                  "timestamp": Math.floor(Date.now() / 1000),
                  "text": {
                    "body": texto
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
  
  try {
    console.log('Enviando requisição para o webhook...');
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos
    });
    
    console.log(`\n✅ RESPOSTA DO WEBHOOK`);
    console.log(`Status: ${response.status}`);
    console.log(`Corpo: ${JSON.stringify(response.data)}`);
    
    return {
      status: 'sucesso',
      resposta: response.data
    };
  } catch (error) {
    console.log(`\n❌ ERRO AO CHAMAR WEBHOOK`);
    
    if (error.response) {
      console.log(`Status do erro: ${error.response.status}`);
      console.log(`Mensagem: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log('Sem resposta do servidor (possível timeout)');
    } else {
      console.log(`Erro: ${error.message}`);
    }
    
    return {
      status: 'erro',
      erro: error.response ? error.response.data : error.message
    };
  }
}

// Função para testar várias mensagens
async function testarWebhook() {
  console.log('\n=== TESTE DO WEBHOOK DO WHATSAPP ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  
  // Lista de mensagens para testar
  const mensagens = [
    { telefone: '5566996151550', texto: 'Olá, queria saber o horário de funcionamento' },
    { telefone: '5566996151550', texto: 'Vocês vendem óculos Ray-Ban?' },
    { telefone: '5566996151550', texto: 'Como faço para marcar um exame de vista?' }
  ];
  
  // Testar cada mensagem
  for (let i = 0; i < mensagens.length; i++) {
    console.log(`\nTeste ${i+1}/${mensagens.length}`);
    const { telefone, texto } = mensagens[i];
    
    await simularMensagemRecebida(telefone, texto);
    
    // Aguardar entre as requisições
    if (i < mensagens.length - 1) {
      console.log('Aguardando 5 segundos antes da próxima requisição...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n=== TESTES CONCLUÍDOS ===');
}

// Executar os testes
testarWebhook();

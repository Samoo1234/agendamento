/**
 * Script para verificar o status atual do webhook do WhatsApp
 * Verifica se o webhook está corretamente configurado e respondendo
 */
const axios = require('axios');

// Configuração
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const VERIFY_TOKEN = 'oticadavi2024';

// Função para verificar o webhook
async function verificarWebhook() {
  console.log('\n=== VERIFICAÇÃO DO WEBHOOK DO WHATSAPP ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`URL do webhook: ${WEBHOOK_URL}`);
  console.log(`Token de verificação: ${VERIFY_TOKEN}`);
  
  // 1. Verificar se o webhook está online (GET simples)
  try {
    console.log('\n1. Verificando se o webhook está online...');
    
    const response = await axios.get(WEBHOOK_URL, { timeout: 10000 });
    
    console.log(`Status: ${response.status}`);
    console.log(`Resposta: ${JSON.stringify(response.data)}`);
    
    if (response.status === 200 || response.status === 403) {
      console.log('✅ Webhook está online!');
    } else {
      console.log('⚠️ Webhook está online, mas retornou um status inesperado.');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar se o webhook está online:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Resposta: ${JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 403) {
        console.log('✅ Webhook está online! (Retornou 403 Forbidden, o que é esperado para uma requisição GET sem parâmetros)');
      } else {
        console.log('⚠️ Webhook está online, mas retornou um erro.');
      }
    } else if (error.request) {
      console.log('❌ Sem resposta do servidor (possível timeout)');
      console.log('⚠️ Webhook pode estar offline ou inacessível.');
    } else {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
  
  // 2. Verificar o endpoint de verificação (simulando verificação do Facebook)
  try {
    console.log('\n2. Verificando o endpoint de verificação (simulando Facebook)...');
    
    const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=CHALLENGE_ACCEPTED`;
    console.log(`URL de verificação: ${url}`);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    console.log(`Status: ${response.status}`);
    console.log(`Resposta: ${response.data}`);
    
    if (response.status === 200 && response.data === 'CHALLENGE_ACCEPTED') {
      console.log('✅ Verificação do webhook bem-sucedida!');
    } else {
      console.log('⚠️ Webhook respondeu, mas a resposta não corresponde ao desafio enviado.');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar o endpoint de verificação:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Resposta: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log('❌ Sem resposta do servidor (possível timeout)');
    } else {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
  
  // 3. Testar o endpoint POST com uma mensagem simples
  try {
    console.log('\n3. Testando o endpoint POST com uma mensagem simples...');
    
    // Payload mínimo para testar
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123456789',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '5566996151550',
                  phone_number_id: '576714648854724'
                },
                contacts: [
                  {
                    profile: {
                      name: 'Teste Webhook'
                    },
                    wa_id: '5566996151550'
                  }
                ],
                messages: [
                  {
                    from: '5566996151550',
                    id: 'wamid.test' + Date.now(),
                    timestamp: Math.floor(Date.now() / 1000),
                    text: {
                      body: 'TESTE WEBHOOK ' + Date.now()
                    },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Resposta: ${JSON.stringify(response.data)}`);
    
    if (response.status === 200) {
      console.log('✅ Teste POST bem-sucedido!');
    } else {
      console.log('⚠️ Webhook respondeu ao POST, mas com um status inesperado.');
    }
  } catch (error) {
    console.log('❌ Erro ao testar o endpoint POST:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Resposta: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log('❌ Sem resposta do servidor (possível timeout)');
    } else {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
  
  // Conclusão
  console.log('\n=== CONCLUSÃO ===');
  console.log('Para que o webhook funcione corretamente com o WhatsApp Business API:');
  console.log('1. O webhook deve estar acessível publicamente (URL válida)');
  console.log('2. O webhook deve responder corretamente à verificação (hub.challenge)');
  console.log('3. O webhook deve processar corretamente as mensagens recebidas (POST)');
  console.log('4. O token de verificação configurado no Facebook deve ser:', VERIFY_TOKEN);
  console.log('\nSe algum dos testes falhou, verifique:');
  console.log('- Se a URL do webhook está correta');
  console.log('- Se o token de verificação está correto');
  console.log('- Se as funções do Firebase estão implantadas corretamente');
  console.log('- Se há erros nos logs do Firebase Functions');
}

// Executar a verificação
verificarWebhook();

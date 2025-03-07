/**
 * Script para testar o webhook do WhatsApp com detalhes completos
 */
const axios = require('axios');

// Configurações
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const TELEFONE = '66999161540';
const MENSAGEM = 'TESTE DETALHADO: Qual o horário de funcionamento da ótica?';

// Função para simular uma mensagem recebida do WhatsApp
async function simularMensagemRecebida() {
  try {
    console.log(`\n=== SIMULAÇÃO DETALHADA DE MENSAGEM RECEBIDA DO WHATSAPP ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Telefone: ${TELEFONE}`);
    console.log(`Mensagem: "${MENSAGEM}"`);
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    
    // Criar payload similar ao que o WhatsApp envia
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '2887557674896481',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '556692582862',
                  phone_number_id: '576714648854724'
                },
                contacts: [
                  {
                    profile: {
                      name: 'Usuário de Teste'
                    },
                    wa_id: TELEFONE.startsWith('55') ? TELEFONE : `55${TELEFONE}`
                  }
                ],
                messages: [
                  {
                    from: TELEFONE.startsWith('55') ? TELEFONE : `55${TELEFONE}`,
                    id: `wamid.TEST${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000),
                    text: {
                      body: MENSAGEM
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
    
    console.log(`\nPayload completo que será enviado:`);
    console.log(JSON.stringify(payload, null, 2));
    
    console.log(`\nEnviando requisição POST para o webhook...`);
    
    // Adicionar timeout mais longo para dar tempo de processar
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos
    });
    
    console.log(`\n=== RESPOSTA DO WEBHOOK ===`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Dados da resposta: ${JSON.stringify(response.data)}`);
    
    console.log(`\n✅ TESTE CONCLUÍDO COM SUCESSO!`);
    console.log(`A mensagem foi enviada para o webhook.`);
    console.log(`Verifique seu celular para confirmar se recebeu a resposta.`);
    console.log(`Verifique também os logs do Firebase para mais detalhes.`);
    
  } catch (error) {
    console.error(`\n❌ ERRO AO ENVIAR MENSAGEM PARA O WEBHOOK`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Dados do erro: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error(`Não houve resposta do servidor: ${error.message}`);
    } else {
      console.error(`Erro: ${error.message}`);
    }
  }
}

// Executar o teste
simularMensagemRecebida();

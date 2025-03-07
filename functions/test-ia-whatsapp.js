/**
 * Script para testar o agente de IA via WhatsApp
 * Simula o recebimento de uma mensagem e verifica se o agente de IA responde corretamente
 */
const axios = require('axios');

// Configuração
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const TELEFONE_TESTE = '5566999161540'; // Número do cliente

// Função para simular uma mensagem recebida
async function simularMensagemRecebida(texto) {
  try {
    console.log(`\n=== SIMULANDO MENSAGEM RECEBIDA ===`);
    console.log(`Telefone: ${TELEFONE_TESTE}`);
    console.log(`Texto: "${texto}"`);
    
    // Criar payload simulando uma mensagem recebida do WhatsApp
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '2887557674896481',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5566999161540',
              phone_number_id: '576714648854724'
            },
            contacts: [{
              profile: { name: 'Cliente Teste' },
              wa_id: TELEFONE_TESTE
            }],
            messages: [{
              from: TELEFONE_TESTE,
              id: `wamid.test${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000).toString(),
              type: 'text',
              text: { body: texto }
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    console.log('Enviando requisição para o webhook...');
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos de timeout
    });
    
    console.log('\n✅ RESPOSTA DO WEBHOOK');
    console.log('Status:', response.status);
    console.log('Corpo:', response.data);
    
    console.log('\nA mensagem foi processada pelo webhook.');
    console.log('Verifique seu WhatsApp para ver se recebeu uma resposta do agente de IA.');
    console.log('Isso pode levar alguns segundos...');
    
    return response.data;
  } catch (error) {
    console.error('\n❌ ERRO AO SIMULAR MENSAGEM');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Corpo:', JSON.stringify(error.response.data));
    } else {
      console.error('Erro:', error.message);
    }
    throw error;
  }
}

// Função principal para executar os testes
async function executarTestes() {
  try {
    console.log('\n=== TESTE DO AGENTE DE IA VIA WHATSAPP ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    
    // Teste 1: Pergunta sobre horário de funcionamento
    await simularMensagemRecebida('Qual o horário de funcionamento da ótica?');
    
    console.log('\nAguardando 10 segundos antes do próximo teste...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Teste 2: Pergunta sobre produtos
    await simularMensagemRecebida('Vocês vendem óculos Ray-Ban?');
    
    console.log('\nAguardando 10 segundos antes do próximo teste...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Teste 3: Pergunta sobre serviços
    await simularMensagemRecebida('Como faço para marcar um exame de vista?');
    
    console.log('\n=== TESTES CONCLUÍDOS ===');
    console.log('Verifique seu WhatsApp para ver se recebeu as respostas do agente de IA.');
    console.log('Se não recebeu, verifique os logs do Firebase Functions para identificar possíveis erros.');
  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR TESTES');
    console.error('Erro:', error);
  }
}

// Executar os testes
executarTestes();

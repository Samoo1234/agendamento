/**
 * Script para testar o agente de IA via WhatsApp com mensagem personalizada
 * Permite enviar uma mensagem específica para testar o agente de IA
 */
const axios = require('axios');
const readline = require('readline');

// Configuração
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';
const TELEFONE_PADRAO = '5566999161540'; // Número do cliente padrão

// Criar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para simular uma mensagem recebida
async function simularMensagemRecebida(texto, telefone) {
  try {
    console.log(`\n=== SIMULANDO MENSAGEM RECEBIDA ===`);
    console.log(`Telefone: ${telefone}`);
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
              wa_id: telefone
            }],
            messages: [{
              from: telefone,
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

// Função para iniciar o teste interativo
function iniciarTesteInterativo() {
  console.log('\n=== TESTE INTERATIVO DO AGENTE DE IA VIA WHATSAPP ===');
  console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log('\nEste script permite enviar mensagens personalizadas para testar o agente de IA.');
  console.log('Para sair, digite "sair" ou pressione Ctrl+C.');
  
  // Perguntar o número de telefone
  rl.question('\nDigite o número de telefone (ou pressione Enter para usar o padrão): ', (telefoneInput) => {
    const telefone = telefoneInput.trim() || TELEFONE_PADRAO;
    console.log(`Usando telefone: ${telefone}`);
    
    // Função para perguntar a mensagem
    function perguntarMensagem() {
      rl.question('\nDigite a mensagem a ser enviada: ', async (mensagem) => {
        if (mensagem.toLowerCase() === 'sair') {
          console.log('\nEncerrando teste interativo...');
          rl.close();
          return;
        }
        
        try {
          await simularMensagemRecebida(mensagem, telefone);
          
          // Perguntar novamente
          setTimeout(() => {
            perguntarMensagem();
          }, 1000);
        } catch (error) {
          console.error('\n❌ Erro ao enviar mensagem:', error.message);
          
          // Perguntar novamente
          setTimeout(() => {
            perguntarMensagem();
          }, 1000);
        }
      });
    }
    
    // Iniciar o loop de perguntas
    perguntarMensagem();
  });
}

// Iniciar o teste interativo
iniciarTesteInterativo();

// Tratar encerramento
rl.on('close', () => {
  console.log('\n=== TESTE ENCERRADO ===');
  process.exit(0);
});

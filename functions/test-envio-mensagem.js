/**
 * Script para testar o envio de mensagens diretamente para o WhatsApp
 * Este script permite enviar uma mensagem de texto para um número específico
 */
const axios = require('axios');
const readline = require('readline');

// Configurações
const TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const PHONE_NUMBER_ID = '576714648854724';
const API_VERSION = 'v21.0';
const TELEFONE_PADRAO = '5566999161540';

// Criar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para enviar mensagem de texto
async function enviarMensagemTexto(telefone, mensagem) {
  try {
    console.log(`\n=== ENVIANDO MENSAGEM DE TEXTO ===`);
    console.log(`Telefone: ${telefone}`);
    console.log(`Mensagem: "${mensagem}"`);
    
    // Formatar o número para o formato internacional
    let numeroFormatado = telefone;
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }
    
    console.log(`Número formatado: ${numeroFormatado}`);
    
    // Criar payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: numeroFormatado,
      type: 'text',
      text: {
        body: mensagem
      }
    };
    
    // Enviar requisição
    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    
    console.log(`Enviando requisição para: ${url}`);
    
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ MENSAGEM ENVIADA COM SUCESSO');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n❌ ERRO AO ENVIAR MENSAGEM');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data));
    } else {
      console.error('Erro:', error.message);
    }
    throw error;
  }
}

// Função para iniciar o teste interativo
function iniciarTesteInterativo() {
  console.log('\n=== TESTE INTERATIVO DE ENVIO DE MENSAGENS ===');
  console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log('\nEste script permite enviar mensagens de texto diretamente para o WhatsApp.');
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
          await enviarMensagemTexto(telefone, mensagem);
          
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

/**
 * Script para testar o envio direto de uma mensagem de diagnóstico
 */
const axios = require('axios');

// Configurações
const TELEFONE = '66999161540'; // Número para teste
const MENSAGEM = 'DIAGNÓSTICO: Este é um teste final para verificar se você está recebendo mensagens do sistema de atendimento da Ótica Davi. Por favor, responda "RECEBI" para confirmar. Hora do envio: ' + new Date().toLocaleTimeString();

// Função para enviar mensagem via WhatsApp
async function enviarMensagem() {
  try {
    console.log(`\n=== TESTE DE MENSAGEM DIRETA ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Telefone: ${TELEFONE}`);
    console.log(`Mensagem: "${MENSAGEM}"`);
    
    // Formatar o número para o formato internacional
    let numeroFormatado = TELEFONE;
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }
    
    const token = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
    const phoneNumberId = '576714648854724';
    const version = 'v21.0';
    
    const payload = {
      messaging_product: 'whatsapp',
      to: numeroFormatado,
      type: 'text',
      text: {
        body: MENSAGEM
      }
    };
    
    console.log(`\nEnviando requisição para a API do WhatsApp...`);
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      data: payload,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n=== RESPOSTA DA API ===`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Dados da resposta:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log(`\n✅ TESTE CONCLUÍDO COM SUCESSO!`);
    console.log(`A mensagem foi enviada via WhatsApp.`);
    console.log(`Verifique seu celular para confirmar o recebimento.`);
    
  } catch (error) {
    console.error(`\n❌ ERRO AO ENVIAR MENSAGEM`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Dados do erro:`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Erro: ${error.message}`);
    }
  }
}

// Executar o teste
enviarMensagem();

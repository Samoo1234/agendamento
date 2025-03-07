/**
 * Script para testar o envio direto de mensagens via WhatsApp
 * Este script envia uma mensagem diretamente para um número específico
 */
const axios = require('axios');

// Configurações
const TELEFONE = '66999161540'; // Número para teste
const MENSAGEM = `TESTE DIRETO: Este é um teste de diagnóstico do sistema de atendimento da Ótica Davi. Se você recebeu esta mensagem, por favor responda "RECEBI". Hora do envio: ${new Date().toLocaleTimeString()}`;

// Token e configurações do WhatsApp
const TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const PHONE_NUMBER_ID = '576714648854724';
const API_VERSION = 'v21.0';

// Função para enviar mensagem
async function enviarMensagem() {
  try {
    console.log(`\n=== TESTE DE ENVIO DIRETO VIA WHATSAPP ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Telefone: ${TELEFONE}`);
    console.log(`\nIniciando envio da mensagem...`);
    
    // Formatar o número para o formato internacional
    let numeroFormatado = TELEFONE;
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }
    
    // Log detalhado
    console.log(`\n=== DETALHES DA REQUISIÇÃO ===`);
    console.log(`Token: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 10)}`);
    console.log(`Phone Number ID: ${PHONE_NUMBER_ID}`);
    console.log(`API Version: ${API_VERSION}`);
    console.log(`Número original: ${TELEFONE}`);
    console.log(`Número formatado: ${numeroFormatado}`);
    console.log(`\nMensagem a ser enviada: "${MENSAGEM}"`);
    
    // Criar o payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: numeroFormatado,
      type: 'text',
      text: {
        body: MENSAGEM
      }
    };
    
    console.log(`\nPayload completo:`);
    console.log(JSON.stringify(payload, null, 2));
    
    // Enviar a mensagem
    console.log(`\nEnviando requisição para a API do WhatsApp...`);
    console.log(`URL: https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`);
    
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      data: payload,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Exibir a resposta
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

/**
 * Script para testar a comunicação com a OpenAI usando uma chave de teste
 */
const axios = require('axios');

// Configuração da OpenAI
const OPENAI_API_KEY = 'sk-test-123'; // Chave de teste para simular a resposta
const OPENAI_MODEL = 'gpt-3.5-turbo';

// Função simulada para gerar resposta
function gerarRespostaSimulada(mensagem) {
  const respostas = {
    'Qual o horário de funcionamento da ótica?': 'A Ótica Davi funciona de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h.',
    'default': 'Desculpe, não entendi sua pergunta. Por favor, seja mais específico ou entre em contato pelo telefone (66) 3333-4444.'
  };
  
  return respostas[mensagem] || respostas.default;
}

// Função para testar a comunicação
async function testarComunicacao(mensagem) {
  try {
    console.log('\nTestando comunicação...');
    console.log(`Mensagem: "${mensagem}"`);
    
    // Simular resposta da OpenAI
    const resposta = gerarRespostaSimulada(mensagem);
    console.log(`\nResposta simulada: "${resposta}"`);
    
    // Enviar mensagem via WhatsApp
    const sucesso = await enviarWhatsApp(mensagem, resposta);
    
    if (sucesso) {
      console.log('\n✅ Teste concluído com sucesso!');
    } else {
      console.log('\n❌ Erro ao enviar mensagem via WhatsApp');
    }
  } catch (error) {
    console.error('\nErro durante o teste:', error.message);
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarWhatsApp(mensagem, resposta) {
  try {
    const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
    const WHATSAPP_PHONE_ID = '576714648854724';
    const telefone = '5566999161540';
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: { body: resposta }
    };
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log('\nResposta do WhatsApp:', response.data);
    return true;
  } catch (error) {
    console.error('\nErro ao enviar mensagem:', error.response?.data || error.message);
    return false;
  }
}

// Executar teste
const mensagem = 'Qual o horário de funcionamento da ótica?';
testarComunicacao(mensagem);

/**
 * Script para testar diretamente a comunicação com WhatsApp e OpenAI
 * Não requer servidor local ou ngrok
 */
const axios = require('axios');
require('dotenv').config();

// Configurações
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '576714648854724';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-3.5-turbo';

// Função para chamar a OpenAI
async function chamarOpenAI(mensagem) {
  try {
    console.log('\nChamando OpenAI...');
    console.log(`Mensagem: "${mensagem}"`);
    
    const mensagens = [
      { 
        role: 'system', 
        content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
      },
      { role: 'user', content: mensagem }
    ];
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: mensagens,
        max_tokens: 250,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const resposta = response.data.choices[0].message.content;
    console.log(`\nResposta da OpenAI: "${resposta}"`);
    return resposta;
  } catch (error) {
    console.error('\nErro ao chamar OpenAI:', error.response?.data || error.message);
    throw error;
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  try {
    const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;
    console.log(`\nEnviando mensagem para ${numeroFormatado}`);
    console.log(`Texto: "${texto}"`);
    
    const message = {
      messaging_product: "whatsapp",
      to: numeroFormatado,
      type: "text",
      text: { body: texto }
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

// Função principal de teste
async function testarIntegracao() {
  try {
    console.log('=== TESTE DE INTEGRAÇÃO DIRETA WHATSAPP + OPENAI ===');
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    
    // Configurações do teste
    const telefone = '66999161540';
    const mensagem = 'Qual o horário de funcionamento da ótica?';
    
    // 1. Testar OpenAI
    console.log('\n1. Testando OpenAI...');
    const resposta = await chamarOpenAI(mensagem);
    
    // 2. Testar WhatsApp
    console.log('\n2. Testando envio via WhatsApp...');
    const sucesso = await enviarMensagemWhatsApp(telefone, resposta);
    
    if (sucesso) {
      console.log('\n✅ Teste concluído com sucesso!');
      console.log('A mensagem foi processada pela OpenAI e enviada via WhatsApp.');
    } else {
      console.log('\n❌ Teste falhou ao enviar mensagem via WhatsApp.');
    }
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testarIntegracao();

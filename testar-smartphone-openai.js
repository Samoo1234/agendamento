/**
 * Script para testar a comunicação entre smartphone e OpenAI
 * Este script simula o recebimento de uma mensagem do webhook do WhatsApp,
 * processa essa mensagem com a OpenAI e envia a resposta de volta para o WhatsApp.
 */
const axios = require('axios');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Configurações do teste
const TELEFONE = '5566999161540';
const MENSAGENS_TESTE = [
  'Quais são os horários de funcionamento da Ótica Davi?',
  'Vocês fazem exames de vista?',
  'Quanto custa um óculos de grau completo?',
  'Vocês aceitam plano de saúde?',
  'Qual o endereço da loja?'
];

// Função principal
async function testarSmartphoneOpenAI() {
  console.log('=== TESTE DE COMUNICAÇÃO SMARTPHONE -> OPENAI -> WHATSAPP ===');
  console.log('Este teste vai enviar várias mensagens para a OpenAI e depois para o seu WhatsApp');
  console.log('Telefone:', TELEFONE);
  console.log('Mensagens de teste:', MENSAGENS_TESTE);
  
  // Processar cada mensagem
  for (let i = 0; i < MENSAGENS_TESTE.length; i++) {
    const mensagem = MENSAGENS_TESTE[i];
    console.log(`\n--- Teste ${i+1}/${MENSAGENS_TESTE.length}: "${mensagem}" ---`);
    
    try {
      // Chamar OpenAI
      console.log('1. Chamando OpenAI...');
      const respostaOpenAI = await chamarOpenAI(mensagem);
      console.log('Resposta da OpenAI:', respostaOpenAI);
      
      // Enviar resposta para WhatsApp
      console.log('2. Enviando resposta para WhatsApp...');
      await enviarMensagemWhatsApp(TELEFONE, `Pergunta: ${mensagem}\n\nResposta: ${respostaOpenAI}`);
      console.log('Resposta enviada com sucesso!');
      
      // Aguardar 3 segundos entre as mensagens
      if (i < MENSAGENS_TESTE.length - 1) {
        console.log('Aguardando 3 segundos antes da próxima mensagem...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`Erro no teste ${i+1}:`, error.message);
    }
  }
  
  console.log('\n=== TESTE CONCLUÍDO ===');
  console.log('Verifique seu smartphone para ver as respostas.');
}

// Função para chamar a OpenAI
async function chamarOpenAI(mensagem) {
  try {
    // Criar mensagens para a API
    const mensagens = [
      { 
        role: 'system', 
        content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
      },
      { role: 'user', content: mensagem }
    ];
    
    // Fazer chamada à API
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
        },
        timeout: 30000 // Timeout de 30 segundos
      }
    );
    
    // Verificar se a resposta é válida
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Resposta inválida da API da OpenAI');
    }
    
    // Extrair a resposta
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: telefone,
        type: 'text',
        text: { body: texto }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

// Executar o teste
testarSmartphoneOpenAI();

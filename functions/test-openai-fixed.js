/**
 * Script para testar a comunicação com a OpenAI usando a chave correta
 */
const axios = require('axios');

// Configuração da OpenAI
const OPENAI_API_KEY = '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';
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
    console.error('\nErro ao chamar OpenAI:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Erro:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Executar teste
const mensagem = 'Qual o horário de funcionamento da ótica?';
chamarOpenAI(mensagem);

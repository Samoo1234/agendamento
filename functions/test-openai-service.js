/**
 * Script para testar diretamente o serviço OpenAI
 * Este script testa a função processarMensagemIA do openaiService.js
 */
const axios = require('axios');

// Configurações
const TELEFONE = '66999161540'; // Número para teste
const MENSAGEM = 'Qual o horário de funcionamento da ótica?';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

// Função para testar o serviço OpenAI
async function testarOpenAIService() {
  try {
    console.log(`\n=== TESTE DO SERVIÇO OPENAI ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Telefone: ${TELEFONE}`);
    console.log(`Mensagem: "${MENSAGEM}"`);
    
    // Fazer chamada direta à API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um assistente de atendimento da Ótica Davi. Forneça respostas curtas e objetivas.' 
          },
          { role: 'user', content: MENSAGEM }
        ],
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
    
    console.log(`\n=== RESPOSTA DA IA ===`);
    console.log(response.data.choices[0].message.content);
    
    console.log(`\n✅ TESTE CONCLUÍDO COM SUCESSO!`);
    
  } catch (error) {
    console.error(`\n❌ ERRO DURANTE O TESTE:`, error.message);
    
    if (error.response) {
      console.error('Detalhes do erro da API:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar o teste
testarOpenAIService();

/**
 * Script para testar a integração direta com a OpenAI
 * Este script testa a comunicação direta com a API da OpenAI
 * para identificar se há problemas de permissão ou configuração
 */

const axios = require('axios');

// Configurações
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 250;
const TEMPERATURE = 0.7;
// Chave da API fixa para garantir funcionamento
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

/**
 * Chama a API da OpenAI para obter uma resposta
 */
async function chamarOpenAI(mensagem) {
  try {
    console.log('=== TESTE DE COMUNICAÇÃO DIRETA COM OPENAI ===');
    console.log('Data e hora:', new Date().toLocaleString());
    console.log('Mensagem:', mensagem);
    console.log('Modelo:', OPENAI_MODEL);
    
    // Criar mensagens para a API
    const mensagens = [
      { 
        "role": "system", 
        "content": "Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos." 
      },
      { "role": "user", "content": mensagem }
    ];
    
    console.log('Iniciando chamada para a API da OpenAI...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: mensagens,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      }
    );
    
    console.log('Resposta recebida com sucesso!');
    console.log('Status da resposta:', response.status);
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const resposta = response.data.choices[0].message.content.trim();
      console.log('Resposta completa da OpenAI:');
      console.log(resposta);
      console.log('\nDetalhes da resposta:');
      console.log('- ID:', response.data.id);
      console.log('- Modelo usado:', response.data.model);
      console.log('- Tokens de entrada:', response.data.usage.prompt_tokens);
      console.log('- Tokens de saída:', response.data.usage.completion_tokens);
      console.log('- Total de tokens:', response.data.usage.total_tokens);
      return resposta;
    } else {
      console.error('Formato de resposta inválido:', JSON.stringify(response.data));
      throw new Error('Formato de resposta inválido da API OpenAI');
    }
  } catch (error) {
    console.error('Erro ao chamar API OpenAI:', error.message);
    
    // Log detalhado do erro
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('Sem resposta do servidor OpenAI (timeout possível)');
    }
    
    throw error;
  }
}

// Função principal
async function main() {
  try {
    const mensagem = process.argv[2] || "Olá, qual o horário de funcionamento da ótica?";
    
    console.log('=== TESTE DE INTEGRAÇÃO COM OPENAI ===');
    console.log('Mensagem a ser processada:', mensagem);
    
    const resposta = await chamarOpenAI(mensagem);
    
    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
    console.log('A comunicação com a OpenAI está funcionando corretamente!');
  } catch (error) {
    console.error('\n=== ERRO NO TESTE ===');
    console.error('A comunicação com a OpenAI falhou:', error.message);
    console.error('Verifique as permissões e configurações da API.');
  }
}

// Executar o teste
main();

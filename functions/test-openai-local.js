/**
 * Script para testar o serviço OpenAI localmente
 * 
 * Este script testa diretamente a API da OpenAI sem precisar do Firebase
 * 
 * Uso:
 * node test-openai-local.js "Mensagem de teste"
 */

const axios = require('axios');

// Configurações
const OPENAI_API_KEY = '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';
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 250;
const TEMPERATURE = 0.7;

// Verificar argumentos
if (process.argv.length < 3) {
  console.error('Erro: Mensagem não fornecida');
  console.log('Uso: node test-openai-local.js "Mensagem de teste"');
  process.exit(1);
}

const mensagem = process.argv[2];

// Função para chamar a API da OpenAI
async function chamarOpenAI(mensagem) {
  try {
    console.log(`Enviando mensagem para OpenAI: "${mensagem}"`);
    
    const prompt = [
      {
        role: "system",
        content: `Você é um assistente virtual da Ótica Davi. 
        Você deve ser cordial, profissional e fornecer informações precisas sobre agendamentos, produtos e serviços.
        
        Serviços oferecidos:
        - Exames de vista
        - Venda de óculos de grau e de sol
        - Lentes de contato
        - Ajustes e consertos
        
        Horário de funcionamento:
        - Segunda a sexta: 9h às 18h
        - Sábado: 9h às 13h
        
        Mantenha respostas concisas e objetivas, limitadas a 2-3 frases quando possível.`
      },
      {
        role: "user",
        content: mensagem
      }
    ];
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: OPENAI_MODEL,
      messages: prompt,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar API da OpenAI:', error.response?.data || error.message);
    return 'Erro ao processar a mensagem.';
  }
}

// Função principal
async function testarOpenAI() {
  try {
    const resposta = await chamarOpenAI(mensagem);
    
    console.log('\nResposta da IA:');
    console.log('-'.repeat(50));
    console.log(resposta);
    console.log('-'.repeat(50));
    
    console.log('\nTeste concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao testar OpenAI:', error);
  }
}

// Executar o teste
testarOpenAI();

/**
 * Script para testar diretamente a API da OpenAI
 * Não depende do Firebase Admin
 */
const axios = require('axios');

// Carregar variáveis de ambiente do arquivo .env se existir
try {
  require('dotenv').config();
} catch (e) {
  console.log('Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
}

// Configurações
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 250;
const TEMPERATURE = 0.7;
const MENSAGEM = 'Qual o horário de funcionamento da ótica?';

// Obter a chave da API das variáveis de ambiente
const getApiKey = () => {
  return process.env.OPENAI_API_KEY;
};

// Função para chamar a API da OpenAI
async function chamarOpenAI(mensagem) {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      console.error('Chave da API OpenAI não configurada');
      return 'Erro: Chave da API OpenAI não configurada';
    }
    
    console.log(`Enviando mensagem para OpenAI: "${mensagem}"`);
    
    const mensagens = [
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
      messages: mensagens,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar API da OpenAI:', error.response?.data || error.message);
    return `Erro: ${error.message}`;
  }
}

// Função principal para testar a API da OpenAI
async function testarOpenAI() {
  try {
    console.log(`\nIniciando teste direto com a API da OpenAI`);
    console.log(`Mensagem: "${MENSAGEM}"\n`);
    
    const resposta = await chamarOpenAI(MENSAGEM);
    
    console.log('\nResposta da OpenAI:');
    console.log('--------------------------------------------------');
    console.log(resposta);
    console.log('--------------------------------------------------\n');
    
    console.log('Teste concluído!');
  } catch (error) {
    console.error('\nErro durante o teste:', error);
  }
}

// Executar o teste
testarOpenAI();

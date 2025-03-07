/**
 * Script para testar o processamento de mensagens com a OpenAI
 * Versão simplificada que não depende do Firebase Admin
 */
const axios = require('axios');

// Configurações
const TELEFONE = '66999161540'; // Seu número
const MENSAGEM = 'Qual o horário de funcionamento da ótica?';

// Função para processar a mensagem com a OpenAI (versão simplificada)
async function processarMensagemComOpenAI(mensagem, telefone) {
  try {
    console.log('\n=== PROCESSANDO MENSAGEM COM OPENAI ===');
    console.log(`Telefone: ${telefone}`);
    console.log(`Mensagem: "${mensagem}"`);
    
    // Obter a chave da API
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Chave da API OpenAI não configurada');
      console.log('Por favor, configure a chave da API OpenAI usando:');
      console.log('export OPENAI_API_KEY=sua_chave_aqui (Linux/Mac)');
      console.log('set OPENAI_API_KEY=sua_chave_aqui (Windows)');
      return 'Erro: Chave da API OpenAI não configurada';
    }
    
    console.log('Chave da API OpenAI encontrada:', apiKey ? 'Sim' : 'Não');
    
    // Criar prompt para a IA
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
    
    console.log('Enviando requisição para a API da OpenAI...');
    
    // Chamar a API da OpenAI diretamente
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: prompt,
      max_tokens: 250,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const resposta = response.data.choices[0].message.content;
    
    console.log('\n=== RESPOSTA DA OPENAI ===');
    console.log(resposta);
    
    return resposta;
  } catch (error) {
    console.error('\n=== ERRO AO PROCESSAR MENSAGEM ===');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Erro: ${error.message}`);
    }
    return `Erro: ${error.message}`;
  }
}

// Função para testar o processamento de mensagens
async function testarProcessamentoIA() {
  try {
    console.log(`\n=== TESTE DE PROCESSAMENTO DE MENSAGEM COM IA ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    
    console.log('\nIniciando processamento...');
    
    // Testar processamento direto
    const respostaDireta = await processarMensagemComOpenAI(MENSAGEM, TELEFONE);
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    console.log('\nPara testar no ambiente de produção, execute:');
    console.log('firebase functions:config:get openai');
    console.log('firebase functions:log');
  } catch (error) {
    console.error('\nErro durante o teste:', error);
  }
}

// Carregar variáveis de ambiente do arquivo .env se existir
try {
  require('dotenv').config();
  console.log('Arquivo .env carregado');
} catch (e) {
  console.log('Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
}

// Executar o teste
testarProcessamentoIA();

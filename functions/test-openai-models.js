/**
 * Script para testar os modelos disponíveis na API da OpenAI
 */
const axios = require('axios');

// Configurações
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

// Função para listar os modelos disponíveis
async function listarModelos() {
  try {
    console.log('\n=== LISTANDO MODELOS DISPONÍVEIS ===');
    console.log('Data e hora:', new Date().toLocaleString());
    
    console.log('\nEnviando requisição para a API da OpenAI...');
    
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== RESPOSTA DA API OPENAI ===');
    console.log('Status:', response.status, response.statusText);
    
    console.log('\n=== MODELOS DISPONÍVEIS ===');
    const modelos = response.data.data;
    
    // Filtrar e ordenar modelos
    const modelosGPT = modelos
      .filter(modelo => modelo.id.includes('gpt'))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    console.log(`Total de modelos GPT: ${modelosGPT.length}`);
    modelosGPT.forEach(modelo => {
      console.log(`- ${modelo.id}`);
    });
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('\n❌ ERRO AO LISTAR MODELOS');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Função para testar um modelo específico
async function testarModelo(modelo) {
  try {
    console.log(`\n=== TESTANDO MODELO: ${modelo} ===`);
    
    // Mensagem de teste simples
    const mensagens = [
      {
        role: 'system',
        content: 'Você é um assistente útil e conciso.'
      },
      {
        role: 'user',
        content: 'Responda apenas com "OK" para confirmar que está funcionando.'
      }
    ];
    
    console.log(`\nEnviando requisição para o modelo ${modelo}...`);
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelo,
      messages: mensagens,
      max_tokens: 50,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n=== RESPOSTA DO MODELO ${modelo} ===`);
    console.log('Status:', response.status, response.statusText);
    console.log('Conteúdo:', response.data.choices[0].message.content);
    
    return true;
  } catch (error) {
    console.error(`\n❌ ERRO AO TESTAR MODELO ${modelo}`);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Erro:', error.response.data.error.message);
    } else {
      console.error('Erro:', error.message);
    }
    
    return false;
  }
}

// Modelos para testar
const modelosParaTestar = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4o',
  'gpt-4o-mini'
];

// Executar os testes
async function executarTestes() {
  // Primeiro, listar todos os modelos disponíveis
  await listarModelos();
  
  // Depois, testar cada modelo específico
  console.log('\n=== TESTANDO MODELOS ESPECÍFICOS ===');
  
  for (const modelo of modelosParaTestar) {
    await testarModelo(modelo);
  }
}

// Iniciar os testes
executarTestes();

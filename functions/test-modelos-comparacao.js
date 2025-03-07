/**
 * Script para testar diferentes modelos da OpenAI e comparar resultados
 */
const axios = require('axios');

// Configurações
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const PERGUNTA = 'Qual o horário de funcionamento da ótica?';

// Lista de modelos para testar
const MODELOS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4o-mini'
];

// Função para testar um modelo específico
async function testarModelo(modelo) {
  console.log(`\n=== TESTANDO MODELO: ${modelo} ===`);
  
  const mensagens = [
    {
      role: 'system',
      content: 'Você é um assistente virtual da Ótica Davi, especializada em óculos de grau, óculos de sol e lentes de contato. Forneça respostas concisas e úteis sobre produtos, serviços e informações da ótica. Horário de funcionamento: segunda a sexta das 8h às 18h e aos sábados das 8h às 12h. Marcas disponíveis: Ray-Ban, Oakley, Prada, Chilli Beans, entre outras. Não indique preços específicos, apenas faixas de preço quando necessário.'
    },
    {
      role: 'user',
      content: PERGUNTA
    }
  ];
  
  const inicio = Date.now();
  
  try {
    console.log(`Enviando requisição para o modelo ${modelo}...`);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: modelo,
        messages: mensagens,
        max_tokens: 250,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      }
    );
    
    const fim = Date.now();
    const tempoTotal = (fim - inicio) / 1000; // em segundos
    
    console.log(`\n=== RESULTADO DO MODELO ${modelo} ===`);
    console.log(`Status: ${response.status} OK`);
    console.log(`Tempo de resposta: ${tempoTotal.toFixed(2)} segundos`);
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const resposta = response.data.choices[0].message.content.trim();
      console.log(`\nResposta: "${resposta}"`);
      
      // Detalhes de uso (tokens)
      if (response.data.usage) {
        console.log(`\nUso de tokens:`);
        console.log(`- Tokens de entrada: ${response.data.usage.prompt_tokens}`);
        console.log(`- Tokens de saída: ${response.data.usage.completion_tokens}`);
        console.log(`- Total de tokens: ${response.data.usage.total_tokens}`);
      }
      
      return {
        modelo,
        status: 'sucesso',
        tempoResposta: tempoTotal,
        resposta,
        tokens: response.data.usage ? response.data.usage.total_tokens : 'N/A'
      };
    } else {
      console.log('Resposta inválida da API');
      return {
        modelo,
        status: 'erro',
        erro: 'Resposta inválida da API'
      };
    }
  } catch (error) {
    const fim = Date.now();
    const tempoTotal = (fim - inicio) / 1000; // em segundos
    
    console.log(`\n❌ ERRO AO TESTAR MODELO ${modelo}`);
    console.log(`Tempo até o erro: ${tempoTotal.toFixed(2)} segundos`);
    
    if (error.response) {
      console.log(`Status do erro: ${error.response.status}`);
      console.log(`Mensagem: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log('Sem resposta do servidor (possível timeout)');
    } else {
      console.log(`Erro: ${error.message}`);
    }
    
    return {
      modelo,
      status: 'erro',
      erro: error.response ? error.response.data : error.message,
      tempoResposta: tempoTotal
    };
  }
}

// Função principal para testar todos os modelos
async function testarTodosModelos() {
  console.log(`\n=== TESTE COMPARATIVO DE MODELOS OPENAI ===`);
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`Pergunta: "${PERGUNTA}"`);
  
  const resultados = [];
  
  for (const modelo of MODELOS) {
    const resultado = await testarModelo(modelo);
    resultados.push(resultado);
  }
  
  console.log(`\n=== RESUMO COMPARATIVO ===`);
  console.log('| Modelo | Status | Tempo (s) | Tokens | Resultado |');
  console.log('|--------|--------|-----------|--------|-----------|');
  
  for (const resultado of resultados) {
    const status = resultado.status === 'sucesso' ? '✅' : '❌';
    const tempo = resultado.tempoResposta ? resultado.tempoResposta.toFixed(2) : 'N/A';
    const tokens = resultado.tokens || 'N/A';
    const resposta = resultado.resposta ? resultado.resposta.substring(0, 30) + '...' : resultado.erro;
    
    console.log(`| ${resultado.modelo} | ${status} | ${tempo} | ${tokens} | ${resposta} |`);
  }
  
  console.log(`\n=== RECOMENDAÇÃO ===`);
  
  // Filtrar apenas os modelos que funcionaram
  const modelosFuncionando = resultados.filter(r => r.status === 'sucesso');
  
  if (modelosFuncionando.length === 0) {
    console.log('❌ Nenhum modelo funcionou corretamente. Verifique a chave da API ou a conexão com a internet.');
  } else {
    // Ordenar por tempo de resposta
    modelosFuncionando.sort((a, b) => a.tempoResposta - b.tempoResposta);
    
    console.log(`✅ Recomendamos usar o modelo: ${modelosFuncionando[0].modelo}`);
    console.log(`   - Tempo de resposta mais rápido: ${modelosFuncionando[0].tempoResposta.toFixed(2)} segundos`);
    console.log(`   - Tokens utilizados: ${modelosFuncionando[0].tokens}`);
  }
}

// Executar o teste
testarTodosModelos();

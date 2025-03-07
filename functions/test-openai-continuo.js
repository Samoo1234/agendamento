/**
 * Script para testar continuamente a API da OpenAI
 * Envia requisições a cada 30 segundos para verificar a estabilidade
 */
const axios = require('axios');
const fs = require('fs');

// Configurações
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';
const INTERVALO_TESTE = 30000; // 30 segundos
const TOTAL_TESTES = 10; // Número total de testes a serem realizados

// Perguntas para testar
const PERGUNTAS = [
  'Qual o horário de funcionamento da ótica?',
  'Vocês vendem lentes de contato?',
  'Quanto custa um óculos Ray-Ban?',
  'Vocês aceitam cartão de crédito?',
  'Como faço para marcar um exame de vista?'
];

// Função para chamar a API da OpenAI
async function chamarOpenAI(mensagem) {
  console.log(`\n=== TESTANDO OPENAI COM MENSAGEM: "${mensagem}" ===`);
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  
  const mensagens = [
    {
      role: 'system',
      content: 'Você é um assistente virtual da Ótica Davi, especializada em óculos de grau, óculos de sol e lentes de contato. Forneça respostas concisas e úteis sobre produtos, serviços e informações da ótica. Horário de funcionamento: segunda a sexta das 8h às 18h e aos sábados das 8h às 12h. Marcas disponíveis: Ray-Ban, Oakley, Prada, Chilli Beans, entre outras. Não indique preços específicos, apenas faixas de preço quando necessário.'
    },
    {
      role: 'user',
      content: mensagem
    }
  ];
  
  const inicio = Date.now();
  
  try {
    console.log(`Enviando requisição para o modelo ${OPENAI_MODEL}...`);
    
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
        timeout: 30000 // 30 segundos
      }
    );
    
    const fim = Date.now();
    const tempoTotal = (fim - inicio) / 1000; // em segundos
    
    console.log(`Status: ${response.status} OK`);
    console.log(`Tempo de resposta: ${tempoTotal.toFixed(2)} segundos`);
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const resposta = response.data.choices[0].message.content.trim();
      console.log(`Resposta: "${resposta}"`);
      
      return {
        status: 'sucesso',
        resposta,
        tempo: tempoTotal,
        timestamp: new Date().toISOString()
      };
    } else {
      console.log('Resposta inválida da API');
      return {
        status: 'erro',
        erro: 'Resposta inválida da API',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    const fim = Date.now();
    const tempoTotal = (fim - inicio) / 1000; // em segundos
    
    console.log(`\n❌ ERRO AO CHAMAR OPENAI`);
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
      status: 'erro',
      erro: error.response ? JSON.stringify(error.response.data) : error.message,
      tempo: tempoTotal,
      timestamp: new Date().toISOString()
    };
  }
}

// Função principal para executar os testes
async function executarTestes() {
  console.log('\n=== TESTE CONTÍNUO DA API OPENAI ===');
  console.log(`Modelo: ${OPENAI_MODEL}`);
  console.log(`Intervalo entre testes: ${INTERVALO_TESTE / 1000} segundos`);
  console.log(`Total de testes: ${TOTAL_TESTES}`);
  console.log(`Iniciando em: ${new Date().toLocaleString()}`);
  
  const resultados = [];
  let contadorTestes = 0;
  
  // Função para executar um único teste
  async function executarUmTeste() {
    contadorTestes++;
    console.log(`\n=== TESTE ${contadorTestes}/${TOTAL_TESTES} ===`);
    
    // Selecionar uma pergunta aleatória
    const perguntaIndex = Math.floor(Math.random() * PERGUNTAS.length);
    const pergunta = PERGUNTAS[perguntaIndex];
    
    // Chamar a API
    const resultado = await chamarOpenAI(pergunta);
    resultado.pergunta = pergunta;
    resultado.testeNumero = contadorTestes;
    
    // Adicionar ao array de resultados
    resultados.push(resultado);
    
    // Salvar resultados parciais
    salvarResultados(resultados);
    
    // Verificar se já atingiu o número máximo de testes
    if (contadorTestes >= TOTAL_TESTES) {
      console.log('\n=== TESTES CONCLUÍDOS ===');
      mostrarResumo(resultados);
      return;
    }
    
    // Agendar o próximo teste
    console.log(`\nPróximo teste em ${INTERVALO_TESTE / 1000} segundos...`);
    setTimeout(executarUmTeste, INTERVALO_TESTE);
  }
  
  // Iniciar o primeiro teste
  executarUmTeste();
}

// Função para salvar os resultados em um arquivo
function salvarResultados(resultados) {
  const dados = {
    timestamp: new Date().toISOString(),
    modelo: OPENAI_MODEL,
    resultados: resultados
  };
  
  try {
    fs.writeFileSync('resultados-teste-continuo.json', JSON.stringify(dados, null, 2));
    console.log('Resultados parciais salvos em resultados-teste-continuo.json');
  } catch (error) {
    console.error('Erro ao salvar resultados:', error);
  }
}

// Função para mostrar um resumo dos resultados
function mostrarResumo(resultados) {
  const total = resultados.length;
  const sucessos = resultados.filter(r => r.status === 'sucesso').length;
  const erros = resultados.filter(r => r.status === 'erro').length;
  const taxaSucesso = (sucessos / total) * 100;
  
  console.log('\n=== RESUMO DOS RESULTADOS ===');
  console.log(`Total de testes: ${total}`);
  console.log(`Testes bem-sucedidos: ${sucessos} (${taxaSucesso.toFixed(2)}%)`);
  console.log(`Testes com erro: ${erros}`);
  
  if (sucessos > 0) {
    const tempos = resultados
      .filter(r => r.status === 'sucesso')
      .map(r => r.tempo);
    
    const tempoMedio = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    const tempoMin = Math.min(...tempos);
    const tempoMax = Math.max(...tempos);
    
    console.log(`Tempo médio de resposta: ${tempoMedio.toFixed(2)} segundos`);
    console.log(`Tempo mínimo: ${tempoMin.toFixed(2)} segundos`);
    console.log(`Tempo máximo: ${tempoMax.toFixed(2)} segundos`);
  }
  
  console.log('\n=== CONCLUSÃO ===');
  if (taxaSucesso === 100) {
    console.log('✅ A API da OpenAI está funcionando perfeitamente!');
  } else if (taxaSucesso >= 80) {
    console.log('⚠️ A API da OpenAI está funcionando, mas com alguns erros ocasionais.');
  } else if (taxaSucesso >= 50) {
    console.log('⚠️ A API da OpenAI está instável, com muitos erros.');
  } else {
    console.log('❌ A API da OpenAI está com problemas graves.');
  }
}

// Iniciar os testes
executarTestes();

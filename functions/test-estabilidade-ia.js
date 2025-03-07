/**
 * Script para testar a estabilidade do serviço de IA
 * Envia múltiplas requisições em sequência para verificar a consistência das respostas
 */
const axios = require('axios');
const fs = require('fs');

// Configurações
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const PHONE_ID = '576714648854724';
const OPENAI_MODEL = 'gpt-4o-mini';
const SEU_NUMERO = '5566996151550'; // Substitua pelo seu número

// Lista de perguntas para testar
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
        tempo: tempoTotal
      };
    } else {
      console.log('Resposta inválida da API');
      return {
        status: 'erro',
        erro: 'Resposta inválida da API'
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
      erro: error.response ? error.response.data : error.message,
      tempo: tempoTotal
    };
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, mensagem) {
  console.log(`\n=== ENVIANDO MENSAGEM PARA ${telefone} ===`);
  console.log(`Mensagem: "${mensagem}"`);
  
  const message = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: telefone,
    type: 'text',
    text: {
      body: mensagem
    }
  };
  
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v13.0/${PHONE_ID}/messages`,
      data: message,
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Mensagem enviada com sucesso!');
    console.log('ID da mensagem:', response.data.messages[0].id);
    
    return {
      status: 'sucesso',
      id: response.data.messages[0].id
    };
  } catch (error) {
    console.log('❌ Erro ao enviar mensagem:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', JSON.stringify(error.response.data));
    }
    
    return {
      status: 'erro',
      erro: error.response ? error.response.data : error.message
    };
  }
}

// Função para testar a estabilidade
async function testarEstabilidade() {
  console.log('\n=== TESTE DE ESTABILIDADE DO SERVIÇO DE IA ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`Modelo OpenAI: ${OPENAI_MODEL}`);
  console.log(`Número de perguntas: ${PERGUNTAS.length}`);
  
  const resultados = [];
  
  // 1. Testar apenas a API da OpenAI
  console.log('\n=== FASE 1: TESTANDO APENAS A API DA OPENAI ===');
  
  for (let i = 0; i < PERGUNTAS.length; i++) {
    console.log(`\nTeste ${i+1}/${PERGUNTAS.length}`);
    const pergunta = PERGUNTAS[i];
    
    const resultado = await chamarOpenAI(pergunta);
    resultados.push({
      fase: 'openai',
      pergunta,
      ...resultado
    });
    
    // Aguardar um pouco entre as requisições para não sobrecarregar a API
    if (i < PERGUNTAS.length - 1) {
      console.log('Aguardando 3 segundos antes da próxima requisição...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // 2. Testar envio de mensagens via WhatsApp
  console.log('\n=== FASE 2: TESTANDO ENVIO DE MENSAGENS VIA WHATSAPP ===');
  
  // Pegar apenas as respostas bem-sucedidas da fase 1
  const respostasOk = resultados
    .filter(r => r.fase === 'openai' && r.status === 'sucesso')
    .map(r => r.resposta);
  
  if (respostasOk.length === 0) {
    console.log('❌ Nenhuma resposta bem-sucedida da OpenAI para enviar via WhatsApp');
  } else {
    for (let i = 0; i < respostasOk.length; i++) {
      console.log(`\nTeste ${i+1}/${respostasOk.length}`);
      const resposta = respostasOk[i];
      
      const resultado = await enviarMensagemWhatsApp(SEU_NUMERO, resposta);
      resultados.push({
        fase: 'whatsapp',
        mensagem: resposta,
        ...resultado
      });
      
      // Aguardar um pouco entre os envios
      if (i < respostasOk.length - 1) {
        console.log('Aguardando 3 segundos antes do próximo envio...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  // Resumo dos resultados
  console.log('\n=== RESUMO DOS RESULTADOS ===');
  
  // Estatísticas da OpenAI
  const openaiTotal = resultados.filter(r => r.fase === 'openai').length;
  const openaiSucesso = resultados.filter(r => r.fase === 'openai' && r.status === 'sucesso').length;
  const openaiErro = resultados.filter(r => r.fase === 'openai' && r.status === 'erro').length;
  const openaiTaxaSucesso = (openaiSucesso / openaiTotal) * 100;
  
  console.log('\nAPI OpenAI:');
  console.log(`- Total de requisições: ${openaiTotal}`);
  console.log(`- Requisições bem-sucedidas: ${openaiSucesso} (${openaiTaxaSucesso.toFixed(2)}%)`);
  console.log(`- Requisições com erro: ${openaiErro}`);
  
  if (openaiSucesso > 0) {
    const tempos = resultados
      .filter(r => r.fase === 'openai' && r.status === 'sucesso')
      .map(r => r.tempo);
    
    const tempoMedio = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    const tempoMin = Math.min(...tempos);
    const tempoMax = Math.max(...tempos);
    
    console.log(`- Tempo médio de resposta: ${tempoMedio.toFixed(2)} segundos`);
    console.log(`- Tempo mínimo: ${tempoMin.toFixed(2)} segundos`);
    console.log(`- Tempo máximo: ${tempoMax.toFixed(2)} segundos`);
  }
  
  // Estatísticas do WhatsApp
  const whatsappTotal = resultados.filter(r => r.fase === 'whatsapp').length;
  const whatsappSucesso = resultados.filter(r => r.fase === 'whatsapp' && r.status === 'sucesso').length;
  const whatsappErro = resultados.filter(r => r.fase === 'whatsapp' && r.status === 'erro').length;
  const whatsappTaxaSucesso = (whatsappSucesso / whatsappTotal) * 100;
  
  console.log('\nAPI WhatsApp:');
  console.log(`- Total de envios: ${whatsappTotal}`);
  console.log(`- Envios bem-sucedidos: ${whatsappSucesso} (${whatsappTaxaSucesso.toFixed(2)}%)`);
  console.log(`- Envios com erro: ${whatsappErro}`);
  
  // Conclusão
  console.log('\n=== CONCLUSÃO ===');
  
  if (openaiTaxaSucesso === 100 && whatsappTaxaSucesso === 100) {
    console.log('✅ O serviço está funcionando perfeitamente!');
  } else if (openaiTaxaSucesso < 50) {
    console.log('❌ Há problemas graves com a API da OpenAI. Verifique a chave da API e os limites de requisições.');
  } else if (whatsappTaxaSucesso < 50) {
    console.log('❌ Há problemas graves com a API do WhatsApp. Verifique o token e as configurações.');
  } else {
    console.log('⚠️ O serviço está funcionando, mas com alguns erros. Verifique os logs para mais detalhes.');
  }
  
  // Salvar resultados em um arquivo local
  const resultadosJson = JSON.stringify({
    timestamp: new Date().toISOString(),
    modelo: OPENAI_MODEL,
    resultados: resultados,
    estatisticas: {
      openai: {
        total: openaiTotal,
        sucesso: openaiSucesso,
        erro: openaiErro,
        taxaSucesso: openaiTaxaSucesso
      },
      whatsapp: {
        total: whatsappTotal,
        sucesso: whatsappSucesso,
        erro: whatsappErro,
        taxaSucesso: whatsappTaxaSucesso
      }
    }
  }, null, 2);
  
  try {
    fs.writeFileSync('resultados-teste-estabilidade.json', resultadosJson);
    console.log('\nResultados salvos em resultados-teste-estabilidade.json');
  } catch (error) {
    console.error('Erro ao salvar resultados:', error);
  }
}

// Executar o teste
testarEstabilidade();

/**
 * Script para testar diretamente a API da OpenAI sem depender do Firebase
 */
const axios = require('axios');

// Configurações
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 250;
const TEMPERATURE = 0.7;

// Função para chamar a API da OpenAI diretamente
async function chamarOpenAI() {
  try {
    console.log('\n=== TESTE DIRETO DA API OPENAI ===');
    console.log('Data e hora:', new Date().toLocaleString());
    
    // Criar mensagens para a API
    const mensagens = [
      {
        role: 'system',
        content: `Você é um assistente virtual da Ótica Davi, especializada em óculos e lentes. 
Seja educado, profissional e direto nas respostas.
Informações importantes:
- Horário de funcionamento: Segunda a sexta das 8h às 18h, sábados das 8h às 12h
- Endereço: Av. Principal, 123, Centro, Cidade
- Telefone: (66) 3333-4444
- Serviços: Exames de vista, ajustes de armações, consertos, venda de óculos e lentes
- Marcas: Ray-Ban, Oakley, Chilli Beans, entre outras
Não invente informações que não foram fornecidas.`
      },
      {
        role: 'user',
        content: 'Qual o horário de funcionamento da ótica?'
      }
    ];
    
    console.log('\nEnviando requisição para a API da OpenAI...');
    console.log('URL:', 'https://api.openai.com/v1/chat/completions');
    console.log('Modelo:', OPENAI_MODEL);
    console.log('Mensagens:', JSON.stringify(mensagens, null, 2));
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: OPENAI_MODEL,
      messages: mensagens,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== RESPOSTA DA API OPENAI ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Conteúdo da resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n=== RESPOSTA FORMATADA ===');
    console.log(response.data.choices[0].message.content);
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('\n❌ ERRO AO CHAMAR API DA OPENAI');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Dados do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Nenhuma resposta recebida:');
      console.error(error.request);
    } else {
      console.error('Erro:', error.message);
    }
    
    console.error('Configuração:', error.config);
  }
}

// Executar o teste
chamarOpenAI();

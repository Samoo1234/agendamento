/**
 * Script para testar diretamente a comunicação com a OpenAI
 */
const axios = require('axios');

// Configurações fixas
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Mensagem de teste
const MENSAGEM = 'Olá, eu gostaria de saber os horários de funcionamento da Ótica Davi.';

async function testarOpenAI() {
  try {
    console.log('=== TESTE DE COMUNICAÇÃO COM OPENAI ===');
    console.log('Enviando mensagem para OpenAI:', MENSAGEM);
    
    // Criar mensagens para a API
    const mensagens = [
      { 
        role: 'system', 
        content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
      },
      { role: 'user', content: MENSAGEM }
    ];
    
    console.log('Fazendo requisição para a API da OpenAI...');
    console.log('URL: https://api.openai.com/v1/chat/completions');
    console.log('Modelo: ' + OPENAI_MODEL);
    
    try {
      console.time('Tempo de resposta');
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
          timeout: 30000 // Timeout de 30 segundos
        }
      );
      console.timeEnd('Tempo de resposta');
      
      console.log('\nResposta da API:', response.status, response.statusText);
      
      // Verificar se a resposta é válida
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('Resposta inválida da API da OpenAI');
      }
      
      // Extrair a resposta
      const resposta = response.data.choices[0].message.content;
      console.log('\nResposta da OpenAI:');
      console.log('--------------------');
      console.log(resposta);
      console.log('--------------------');
      
      console.log('\n✅ Teste concluído com sucesso!');
      
      // Agora vamos testar o envio da resposta para o WhatsApp
      console.log('\n=== TESTE DE INTEGRAÇÃO COMPLETA ===');
      console.log('Enviando a resposta da OpenAI para o WhatsApp...');
      
      await enviarRespostaParaWhatsApp('5566999161540', resposta);
    } catch (error) {
      console.error('\n❌ Erro ao chamar OpenAI:', error.message);
      
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data && error.response.data.error) {
          console.error('\nMensagem de erro da API:', error.response.data.error.message);
          
          if (error.response.data.error.type === 'invalid_request_error') {
            console.error('\n⚠️ Requisição inválida. Verifique os parâmetros enviados.');
          } else if (error.response.data.error.type === 'authentication_error') {
            console.error('\n⚠️ Erro de autenticação. Verifique a chave da API.');
          } else if (error.response.data.error.type === 'insufficient_quota') {
            console.error('\n⚠️ Cota insuficiente. Verifique o saldo da sua conta OpenAI.');
          }
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarRespostaParaWhatsApp(telefone, texto) {
  const WHATSAPP_PHONE_ID = '576714648854724';
  const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: telefone,
        type: 'text',
        text: { body: texto }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\nResposta da API do WhatsApp:', response.status, response.statusText);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    console.log('\n✅ Resposta enviada com sucesso para o WhatsApp!');
    console.log('Verifique seu smartphone para confirmar o recebimento da resposta.');
  } catch (error) {
    console.error('\n❌ Erro ao enviar resposta para WhatsApp:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar o teste
testarOpenAI();

/**
 * SOLUÇÃO INTEGRADA PARA WHATSAPP + OPENAI (VERSÃO AUTOMÁTICA)
 * 
 * Este script simula o recebimento de uma mensagem do webhook do WhatsApp,
 * processa essa mensagem com a OpenAI e envia a resposta de volta para o WhatsApp.
 * 
 * Não depende de servidor Express ou webhook, é uma solução direta.
 */
const axios = require('axios');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Configurações automáticas
const TELEFONE = '5566999161540';
const MENSAGEM = 'Quais são os tipos de lentes que vocês oferecem e quais são as diferenças entre elas?';

async function solucaoIntegrada() {
  try {
    console.log('=== SOLUÇÃO INTEGRADA WHATSAPP + OPENAI (AUTOMÁTICA) ===');
    
    console.log('\n1. Simulando recebimento de mensagem do WhatsApp');
    console.log('   Telefone:', TELEFONE);
    console.log('   Mensagem:', MENSAGEM);
    
    // Processar a mensagem com a OpenAI
    console.log('\n2. Processando mensagem com a OpenAI...');
    
    try {
      // Criar mensagens para a API
      const mensagens = [
        { 
          role: 'system', 
          content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
        },
        { role: 'user', content: MENSAGEM }
      ];
      
      console.time('Tempo de resposta da OpenAI');
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
      console.timeEnd('Tempo de resposta da OpenAI');
      
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
      
      // Enviar a resposta para o WhatsApp
      console.log('\n3. Enviando resposta para o WhatsApp...');
      
      console.time('Tempo de resposta do WhatsApp');
      const whatsappResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: TELEFONE,
          type: 'text',
          text: { body: resposta }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.timeEnd('Tempo de resposta do WhatsApp');
      
      console.log('\nResposta da API do WhatsApp:', whatsappResponse.status, whatsappResponse.statusText);
      console.log('ID da mensagem:', whatsappResponse.data.messages[0].id);
      
      console.log('\n✅ PROCESSO COMPLETO EXECUTADO COM SUCESSO!');
      console.log('Verifique seu smartphone para confirmar o recebimento da resposta.');
    } catch (error) {
      console.error('\n❌ Erro ao processar mensagem:', error.message);
      
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

// Executar a solução
solucaoIntegrada();

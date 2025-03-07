/**
 * Script para simular o recebimento de uma mensagem "Oi" do webhook
 * e diagnosticar o problema específico
 */
const axios = require('axios');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Telefone e mensagem
const TELEFONE = '5566999161540';
const MENSAGEM = 'Oi';

// Função principal
async function simularWebhookOi() {
  console.log('=== SIMULAÇÃO DE WEBHOOK PARA MENSAGEM "OI" ===');
  console.log('Este script vai simular o recebimento de uma mensagem "Oi" do webhook');
  console.log('e diagnosticar o problema específico');
  console.log('Telefone:', TELEFONE);
  console.log('Mensagem:', MENSAGEM);
  
  try {
    // 1. Simular o recebimento da mensagem
    console.log('\n1. Simulando recebimento da mensagem...');
    
    // Estrutura da mensagem do webhook
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '2887557674896481',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '556633334444',
                  phone_number_id: WHATSAPP_PHONE_ID
                },
                contacts: [
                  {
                    profile: {
                      name: 'Usuário Teste'
                    },
                    wa_id: TELEFONE.replace('55', '')
                  }
                ],
                messages: [
                  {
                    from: TELEFONE.replace('55', ''),
                    id: 'wamid.abcdefghijklmnopqrstuvwxyz',
                    timestamp: Math.floor(Date.now() / 1000),
                    text: {
                      body: MENSAGEM
                    },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };
    
    console.log('Payload do webhook simulado:', JSON.stringify(webhookPayload, null, 2));
    
    // 2. Tentar processar a mensagem diretamente
    console.log('\n2. Processando mensagem diretamente...');
    
    try {
      // Extrair o texto da mensagem
      const textoMensagem = webhookPayload.entry[0].changes[0].value.messages[0].text.body;
      console.log('Texto da mensagem:', textoMensagem);
      
      // 3. Chamar a OpenAI
      console.log('\n3. Chamando a OpenAI...');
      
      try {
        // Criar mensagens para a API
        const mensagens = [
          { 
            role: 'system', 
            content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
          },
          { role: 'user', content: textoMensagem }
        ];
        
        console.log('Mensagens para a OpenAI:', JSON.stringify(mensagens, null, 2));
        
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
        
        // 4. Enviar a resposta para o WhatsApp
        console.log('\n4. Enviando resposta para o WhatsApp...');
        
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
        
        console.log('\n✅ SIMULAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('Verifique seu smartphone para confirmar o recebimento da resposta.');
        console.log('\nDiagnóstico: O problema não está na comunicação com a OpenAI ou com o WhatsApp.');
        console.log('O problema está na forma como o webhook está processando a mensagem recebida.');
        console.log('Recomendação: Verifique se o servidor que recebe o webhook está configurado corretamente');
        console.log('e se está conseguindo extrair corretamente o texto da mensagem da estrutura do webhook.');
      } catch (openaiError) {
        console.error('\n❌ Erro ao chamar a OpenAI:', openaiError.message);
        
        if (openaiError.response) {
          console.error('Status do erro:', openaiError.response.status);
          console.error('Dados do erro:', JSON.stringify(openaiError.response.data, null, 2));
        }
        
        console.log('\nDiagnóstico: O problema está na comunicação com a OpenAI.');
        console.log('Verifique se a chave da API está correta e se o modelo está disponível.');
      }
    } catch (processError) {
      console.error('\n❌ Erro ao processar a mensagem:', processError.message);
      console.log('\nDiagnóstico: O problema está na extração do texto da mensagem da estrutura do webhook.');
      console.log('Verifique se a estrutura do webhook está correta e se o servidor está conseguindo acessar os campos necessários.');
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

// Executar a simulação
simularWebhookOi();

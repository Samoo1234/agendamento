/**
 * Script para testar o envio de mensagem diretamente via WhatsApp API
 * Não depende do webhook, apenas envia uma mensagem diretamente
 */
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

// Configurações
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '576714648854724';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Criar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para chamar a OpenAI
async function chamarOpenAI(mensagem) {
  try {
    console.log('Chamando OpenAI...');
    
    // Criar mensagens para a API
    const mensagens = [
      { 
        role: 'system', 
        content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
      },
      { role: 'user', content: mensagem }
    ];
    
    // Fazer chamada à API
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
        timeout: 30000 // Aumentar timeout para 30 segundos
      }
    );
    
    // Verificar se a resposta é válida
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error('Resposta inválida da OpenAI:', response.data);
      return 'Desculpe, não consegui gerar uma resposta. Por favor, tente novamente mais tarde.';
    }
    
    // Extrair resposta
    const resposta = response.data.choices[0].message.content;
    
    // Registrar uso
    const tokens = response.data.usage.total_tokens;
    console.log(`Uso de tokens: ${tokens}`);
    
    return resposta;
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error; // Propagar o erro para ser tratado pelo chamador
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  try {
    console.log(`Enviando mensagem para ${telefone}: "${texto}"`);
    
    // Garantir que o texto não seja undefined ou null
    if (!texto) {
      texto = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: {
        body: texto
      }
    };
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 30000 // Aumentar timeout para 30 segundos
    });
    
    console.log('Resposta da API do WhatsApp:', response.data);
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp:', error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

// Função principal
async function main() {
  console.log('=== TESTE DE ENVIO DE MENSAGEM WHATSAPP + OPENAI ===');
  console.log('Este script permite testar o envio de mensagens diretamente, sem depender do webhook.');
  
  // Solicitar número de telefone
  rl.question('\nDigite o número de telefone (com DDD, sem +55): ', async (telefone) => {
    // Formatar telefone
    if (!telefone.startsWith('55')) {
      telefone = '55' + telefone;
    }
    
    console.log(`\nTelefone configurado: ${telefone}`);
    
    // Perguntar se quer enviar mensagem de teste ou processar com OpenAI
    rl.question('\nEscolha uma opção:\n1. Enviar mensagem de teste\n2. Processar mensagem com OpenAI\nOpção (1 ou 2): ', async (opcao) => {
      try {
        if (opcao === '1') {
          // Enviar mensagem de teste
          const mensagemTeste = 'Olá! Esta é uma mensagem de teste do sistema de integração WhatsApp + OpenAI da Ótica Davi. Se você recebeu esta mensagem, a configuração foi bem-sucedida!';
          
          console.log('\nEnviando mensagem de teste...');
          const sucesso = await enviarMensagemWhatsApp(telefone, mensagemTeste);
          
          if (sucesso) {
            console.log('✅ Mensagem de teste enviada com sucesso!');
          } else {
            console.error('❌ Falha ao enviar mensagem de teste!');
          }
        } else if (opcao === '2') {
          // Processar mensagem com OpenAI
          rl.question('\nDigite a mensagem para processar com a OpenAI: ', async (mensagem) => {
            try {
              console.log('\nProcessando mensagem com OpenAI...');
              const resposta = await chamarOpenAI(mensagem);
              
              console.log(`\nResposta da OpenAI: "${resposta}"`);
              
              // Perguntar se quer enviar a resposta
              rl.question('\nEnviar esta resposta para o WhatsApp? (s/n): ', async (enviar) => {
                if (enviar.toLowerCase() === 's') {
                  console.log('\nEnviando resposta para o WhatsApp...');
                  const sucesso = await enviarMensagemWhatsApp(telefone, resposta);
                  
                  if (sucesso) {
                    console.log('✅ Resposta enviada com sucesso!');
                  } else {
                    console.error('❌ Falha ao enviar resposta!');
                  }
                } else {
                  console.log('Envio cancelado pelo usuário.');
                }
                
                rl.close();
              });
            } catch (error) {
              console.error('Erro ao processar mensagem:', error);
              rl.close();
            }
          });
          
          return; // Não fechar o rl ainda
        } else {
          console.log('Opção inválida. Por favor, escolha 1 ou 2.');
        }
        
        if (opcao !== '2') {
          rl.close();
        }
      } catch (error) {
        console.error('Erro no processamento:', error);
        rl.close();
      }
    });
  });
}

// Executar o script
main();

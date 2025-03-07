/**
 * SOLUÇÃO COMPLETA SEM WEBHOOK
 * 
 * Este script implementa uma solução completa que:
 * 1. Recebe mensagens do usuário via terminal
 * 2. Processa as mensagens com a OpenAI
 * 3. Envia as respostas para o WhatsApp do usuário
 * 
 * Não depende de webhook, o que elimina problemas de configuração.
 */
const axios = require('axios');
const readline = require('readline');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para registrar logs
function log(tipo, mensagem, dados = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${tipo}] ${mensagem}`);
  
  if (dados) {
    console.log(JSON.stringify(dados, null, 2));
  }
}

// Função para chamar a OpenAI
async function chamarOpenAI(mensagem) {
  log('INFO', 'Chamando OpenAI', { mensagem });
  
  try {
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
        timeout: 30000 // Timeout de 30 segundos
      }
    );
    
    log('INFO', 'Resposta da OpenAI recebida', { status: response.status });
    
    // Verificar se a resposta é válida
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Resposta inválida da API da OpenAI');
    }
    
    // Extrair a resposta
    const resposta = response.data.choices[0].message.content;
    log('INFO', 'Resposta processada', { resposta });
    
    return resposta;
  } catch (error) {
    log('ERROR', 'Erro ao chamar OpenAI', error);
    
    if (error.response) {
      log('ERROR', 'Detalhes do erro da API', { 
        status: error.response.status, 
        data: error.response.data 
      });
    }
    
    throw error;
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  log('INFO', 'Enviando mensagem WhatsApp', { telefone, texto });
  
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
    
    log('SUCCESS', 'Mensagem WhatsApp enviada', { 
      status: response.status, 
      data: response.data 
    });
    
    return response.data;
  } catch (error) {
    log('ERROR', 'Erro ao enviar mensagem WhatsApp', error);
    
    if (error.response) {
      log('ERROR', 'Detalhes do erro da API', { 
        status: error.response.status, 
        data: error.response.data 
      });
    }
    
    throw error;
  }
}

// Função principal
async function iniciarConversa() {
  log('INFO', '=== SOLUÇÃO COMPLETA SEM WEBHOOK ===');
  log('INFO', 'Esta solução permite conversar com a OpenAI via WhatsApp sem depender de webhook');
  
  // Solicitar número de telefone
  const telefone = await new Promise(resolve => {
    rl.question('Digite seu número de telefone (com DDD, sem o +55): ', (answer) => {
      resolve(answer.trim());
    });
  });
  
  if (!telefone || telefone.length < 10) {
    log('ERROR', 'Número de telefone inválido');
    rl.close();
    return;
  }
  
  // Adicionar prefixo 55 se não estiver presente
  const telefoneCompleto = telefone.startsWith('55') ? telefone : `55${telefone}`;
  
  log('INFO', `Conversa iniciada com o número ${telefoneCompleto}`);
  log('INFO', 'Digite "sair" para encerrar a conversa');
  
  // Enviar mensagem de boas-vindas
  await enviarMensagemWhatsApp(
    telefoneCompleto, 
    'Olá! Sou o assistente virtual da Ótica Davi. Como posso ajudar você hoje?'
  );
  
  // Loop de conversa
  while (true) {
    // Solicitar mensagem
    const mensagem = await new Promise(resolve => {
      rl.question('\nDigite sua mensagem (ou "sair" para encerrar): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    // Verificar se quer sair
    if (mensagem.toLowerCase() === 'sair') {
      log('INFO', 'Encerrando conversa');
      await enviarMensagemWhatsApp(
        telefoneCompleto, 
        'Obrigado por conversar comigo! Se precisar de mais ajuda, é só enviar uma mensagem. Tenha um ótimo dia!'
      );
      break;
    }
    
    try {
      // Processar mensagem com OpenAI
      log('INFO', 'Processando mensagem com OpenAI');
      const respostaIA = await chamarOpenAI(mensagem);
      
      // Enviar resposta para o WhatsApp
      await enviarMensagemWhatsApp(telefoneCompleto, respostaIA);
      log('SUCCESS', 'Resposta enviada com sucesso');
    } catch (error) {
      log('ERROR', 'Erro ao processar mensagem', error);
      
      // Enviar mensagem de erro
      await enviarMensagemWhatsApp(
        telefoneCompleto, 
        'Desculpe, estamos com problemas técnicos no momento. Por favor, tente novamente mais tarde ou entre em contato pelo telefone (66) 3333-4444.'
      );
    }
  }
  
  rl.close();
}

// Iniciar a conversa
iniciarConversa();

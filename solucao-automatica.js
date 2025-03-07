/**
 * SOLUÇÃO AUTOMÁTICA COMPLETA
 * 
 * Este script implementa uma solução completa automatizada que:
 * 1. Usa um número de telefone pré-configurado
 * 2. Envia uma mensagem inicial para o WhatsApp
 * 3. Processa mensagens pré-definidas com a OpenAI
 * 4. Envia as respostas para o WhatsApp do usuário
 * 
 * Não depende de webhook e não requer entrada do usuário.
 */
const axios = require('axios');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Telefone e mensagens pré-definidas
const TELEFONE = '5566999161540'; // Substitua pelo seu número
const MENSAGENS = [
  'Olá, gostaria de saber os horários de funcionamento da Ótica Davi.',
  'Vocês fazem exames de vista?',
  'Quanto custa um óculos de grau completo?',
  'Vocês aceitam plano de saúde?',
  'Qual o endereço da loja?'
];

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
async function executarAutomatico() {
  log('INFO', '=== SOLUÇÃO AUTOMÁTICA COMPLETA ===');
  log('INFO', 'Esta solução processa mensagens pré-definidas com a OpenAI e envia as respostas para o WhatsApp');
  log('INFO', `Telefone: ${TELEFONE}`);
  log('INFO', `Mensagens: ${MENSAGENS.length}`);
  
  try {
    // Enviar mensagem de boas-vindas
    await enviarMensagemWhatsApp(
      TELEFONE, 
      'Olá! Sou o assistente virtual da Ótica Davi. Vou processar algumas perguntas comuns e enviar as respostas para você.'
    );
    
    // Processar cada mensagem
    for (let i = 0; i < MENSAGENS.length; i++) {
      const mensagem = MENSAGENS[i];
      log('INFO', `Processando mensagem ${i+1}/${MENSAGENS.length}: "${mensagem}"`);
      
      try {
        // Processar mensagem com OpenAI
        const respostaIA = await chamarOpenAI(mensagem);
        
        // Enviar pergunta e resposta para o WhatsApp
        await enviarMensagemWhatsApp(TELEFONE, `Pergunta: ${mensagem}\n\nResposta: ${respostaIA}`);
        log('SUCCESS', `Resposta ${i+1} enviada com sucesso`);
        
        // Aguardar 3 segundos entre as mensagens
        if (i < MENSAGENS.length - 1) {
          log('INFO', 'Aguardando 3 segundos antes da próxima mensagem...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        log('ERROR', `Erro ao processar mensagem ${i+1}`, error);
        
        // Enviar mensagem de erro
        await enviarMensagemWhatsApp(
          TELEFONE, 
          `Desculpe, ocorreu um erro ao processar a pergunta: "${mensagem}"`
        );
      }
    }
    
    // Enviar mensagem de encerramento
    await enviarMensagemWhatsApp(
      TELEFONE, 
      'Teste concluído! Todas as mensagens foram processadas. Se precisar de mais informações, entre em contato com a Ótica Davi pelo telefone (66) 3333-4444.'
    );
    
    log('INFO', 'Processamento concluído com sucesso!');
  } catch (error) {
    log('ERROR', 'Erro geral na execução', error);
  }
}

// Executar a solução automática
executarAutomatico();

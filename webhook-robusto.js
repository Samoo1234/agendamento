/**
 * WEBHOOK ROBUSTO PARA WHATSAPP + OPENAI
 * 
 * Este servidor recebe mensagens do WhatsApp via webhook,
 * processa-as com a OpenAI e envia as respostas de volta.
 * 
 * Inclui logs detalhados para diagnóstico de problemas.
 */
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

// Configurações
const PORT = 3001;
const VERIFY_TOKEN = 'oticadavi2024';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Criar aplicação Express
const app = express();

// Configurar middleware para analisar JSON
app.use(bodyParser.json());

// Função para registrar logs
function log(tipo, mensagem, dados = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${tipo}] ${mensagem}`);
  
  if (dados) {
    console.log(JSON.stringify(dados, null, 2));
  }
}

// Rota para verificação do webhook (GET)
app.get('/webhook', (req, res) => {
  log('INFO', 'Recebida solicitação de verificação do webhook', req.query);
  
  // Extrair parâmetros da solicitação
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Verificar token
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    log('SUCCESS', 'Webhook verificado com sucesso');
    res.status(200).send(challenge);
  } else {
    log('ERROR', 'Falha na verificação do webhook', { mode, token, expected: VERIFY_TOKEN });
    res.status(403).send('Forbidden');
  }
});

// Rota para receber mensagens (POST)
app.post('/webhook', async (req, res) => {
  try {
    log('INFO', 'Webhook recebido', { body: req.body });
    
    // Verificar se a estrutura da requisição é válida
    if (!req.body || !req.body.object) {
      log('ERROR', 'Estrutura da requisição inválida');
      return res.status(400).send('Bad Request');
    }
    
    // Responder imediatamente para evitar timeout
    res.status(200).send('OK');
    
    // Verificar se é uma mensagem do WhatsApp
    if (req.body.object !== 'whatsapp_business_account') {
      log('ERROR', 'Objeto não é whatsapp_business_account', { object: req.body.object });
      return;
    }
    
    // Verificar se há mensagens
    if (!req.body.entry || !req.body.entry[0] || !req.body.entry[0].changes || 
        !req.body.entry[0].changes[0] || !req.body.entry[0].changes[0].value || 
        !req.body.entry[0].changes[0].value.messages || !req.body.entry[0].changes[0].value.messages[0]) {
      log('INFO', 'Webhook recebido, mas não contém mensagem');
      return;
    }
    
    // Extrair dados da mensagem
    const mensagem = req.body.entry[0].changes[0].value.messages[0];
    const telefone = req.body.entry[0].changes[0].value.contacts[0].wa_id;
    
    log('INFO', 'Mensagem recebida', { mensagem, telefone });
    
    // Extrair texto da mensagem
    let textoMensagem = '';
    if (mensagem.type === 'text' && mensagem.text && mensagem.text.body) {
      textoMensagem = mensagem.text.body;
    } else if (mensagem.type === 'interactive' && mensagem.interactive.type === 'button_reply') {
      textoMensagem = mensagem.interactive.button_reply.title;
    } else {
      textoMensagem = 'Mensagem não reconhecida';
    }
    
    log('INFO', 'Texto extraído', { textoMensagem });
    
    // Processar mensagem com OpenAI
    try {
      log('INFO', 'Chamando OpenAI', { mensagem: textoMensagem });
      
      const respostaIA = await chamarOpenAI(textoMensagem);
      log('SUCCESS', 'Resposta da OpenAI recebida', { resposta: respostaIA });
      
      // Enviar resposta para o WhatsApp
      await enviarMensagemWhatsApp(telefone, respostaIA);
      log('SUCCESS', 'Resposta enviada para o WhatsApp', { telefone });
    } catch (error) {
      log('ERROR', 'Erro ao processar mensagem', error);
      
      // Enviar mensagem de erro
      await enviarMensagemWhatsApp(
        telefone,
        'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente mais tarde.'
      );
    }
  } catch (error) {
    log('ERROR', 'Erro geral no processamento do webhook', error);
    
    // Já enviamos a resposta 200 OK, então não precisamos enviar outra resposta HTTP
  }
});

// Função para chamar a OpenAI
async function chamarOpenAI(mensagem) {
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
    
    // Verificar se a resposta é válida
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Resposta inválida da API da OpenAI');
    }
    
    // Extrair a resposta
    const resposta = response.data.choices[0].message.content;
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

// Iniciar servidor
app.listen(PORT, () => {
  log('INFO', `=== WEBHOOK ROBUSTO PARA WHATSAPP + OPENAI ===`);
  log('INFO', `Servidor iniciado na porta ${PORT}`);
  log('INFO', `URL do webhook: http://localhost:${PORT}/webhook`);
  log('INFO', `Token de verificação: ${VERIFY_TOKEN}`);
  log('INFO', `Aguardando mensagens...`);
  log('INFO', `Use o Ngrok para expor o servidor: ngrok http ${PORT}`);
});

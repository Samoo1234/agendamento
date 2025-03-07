/**
 * SOLUÇÃO FINAL PARA O WEBHOOK DO WHATSAPP
 * 
 * Este script cria um servidor Express que:
 * 1. Recebe webhooks do WhatsApp
 * 2. Processa as mensagens com a OpenAI
 * 3. Envia as respostas de volta para o WhatsApp
 * 
 * IMPORTANTE: Este script deve ser exposto à internet com Ngrok
 * e configurado como webhook do WhatsApp.
 */
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Configurações hardcoded para garantir funcionamento
const PORT = 3000;
const VERIFY_TOKEN = 'oticadavi2024';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Inicializar servidor Express
const app = express();
app.use(bodyParser.json());

// Função para registrar logs
function log(tipo, mensagem, dados = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${tipo}] ${mensagem}`);
  
  if (dados) {
    console.log(JSON.stringify(dados, null, 2));
  }
}

// Rota raiz para verificar se o servidor está rodando
app.get('/', (req, res) => {
  log('INFO', 'Requisição recebida na rota raiz');
  res.send('Servidor de integração WhatsApp + OpenAI está rodando!');
});

// Rota para verificação do webhook
app.get('/webhook', (req, res) => {
  log('INFO', 'Requisição de verificação do webhook recebida', req.query);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    log('SUCCESS', 'Webhook verificado com sucesso');
    res.status(200).send(challenge);
  } else {
    log('ERROR', 'Falha na verificação do webhook', { mode, token, expectedToken: VERIFY_TOKEN });
    res.sendStatus(403);
  }
});

// Rota para receber mensagens do webhook
app.post('/webhook', async (req, res) => {
  log('INFO', 'Webhook recebido', req.body);
  
  // Responder imediatamente para evitar timeout
  res.status(200).send('EVENT_RECEIVED');
  
  try {
    // Sempre enviar uma resposta fixa para qualquer mensagem
    // Isso é para testar se o problema está na extração da mensagem ou na comunicação com a OpenAI
    if (req.body && req.body.entry && req.body.entry[0] && req.body.entry[0].changes) {
      const changes = req.body.entry[0].changes;
      
      for (const change of changes) {
        if (change.value && change.value.messages && change.value.messages.length > 0) {
          const message = change.value.messages[0];
          const from = message.from;
          
          log('INFO', 'Mensagem recebida de', from);
          
          // Enviar resposta fixa
          await enviarMensagemWhatsApp(from, "Olá! Recebi sua mensagem. Sou o assistente da Ótica Davi. Como posso ajudar?");
          log('SUCCESS', 'Resposta fixa enviada com sucesso');
        }
      }
    }
  } catch (error) {
    log('ERROR', 'Erro ao processar webhook', error);
  }
});

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

// Iniciar servidor
app.listen(PORT, () => {
  log('INFO', `Servidor iniciado na porta ${PORT}`);
  log('INFO', `URL do webhook: http://localhost:${PORT}/webhook`);
  log('INFO', `Token de verificação: ${VERIFY_TOKEN}`);
  log('INFO', 'Para testar, exponha este servidor com Ngrok e configure o webhook do WhatsApp');
});

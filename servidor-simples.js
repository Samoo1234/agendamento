/**
 * Servidor simplificado para testar integração com WhatsApp
 * Este servidor apenas responde com uma mensagem fixa
 */
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

// Configurações
const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'oticadavi2024';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '576714648854724';

// Middleware
app.use(bodyParser.json());

// Rota raiz para verificar se o servidor está rodando
app.get('/', (req, res) => {
  res.send('Servidor de teste simplificado está rodando!');
});

// Rota para verificação do webhook
app.get('/webhook', (req, res) => {
  console.log('Recebida solicitação GET para /webhook');
  console.log('Query params:', req.query);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`Mode: ${mode}, Token: ${token}, Challenge: ${challenge}, Expected Token: ${VERIFY_TOKEN}`);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    console.error('Falha na verificação do webhook');
    res.sendStatus(403);
  }
});

// Rota para receber mensagens do webhook
app.post('/webhook', async (req, res) => {
  console.log('Recebida solicitação POST para /webhook');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Responder imediatamente para evitar timeout
  res.status(200).send('EVENT_RECEIVED');
  
  try {
    const body = req.body;
    
    // Verificar se a estrutura da requisição é válida
    if (!body || !body.object || body.object !== 'whatsapp_business_account') {
      console.log('Estrutura da requisição inválida');
      return;
    }
    
    if (!body.entry || !body.entry[0] || !body.entry[0].changes || !body.entry[0].changes[0] || 
        !body.entry[0].changes[0].value || !body.entry[0].changes[0].value.messages || 
        !body.entry[0].changes[0].value.messages[0]) {
      console.log('Estrutura de mensagem inválida ou mensagem não encontrada');
      return;
    }
    
    // Extrair informações da mensagem
    const mensagem = body.entry[0].changes[0].value.messages[0];
    const telefone = body.entry[0].changes[0].value.contacts[0].wa_id;
    
    console.log('Mensagem recebida:', JSON.stringify(mensagem, null, 2));
    console.log('Telefone recebido:', telefone);
    
    // Extrair o texto da mensagem
    let textoMensagem = '';
    if (mensagem.type === 'text' && mensagem.text && mensagem.text.body) {
      textoMensagem = mensagem.text.body;
    } else if (mensagem.type === 'interactive' && mensagem.interactive.type === 'button_reply') {
      textoMensagem = mensagem.interactive.button_reply.title;
    } else {
      textoMensagem = 'Mensagem não reconhecida';
    }
    
    console.log('Texto da mensagem:', textoMensagem);
    
    // Enviar resposta fixa
    const respostaFixa = "Olá! Esta é uma resposta de teste do servidor simplificado. Sua mensagem foi recebida com sucesso!";
    await enviarMensagemWhatsApp(telefone, respostaFixa);
    
    console.log('Resposta enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
  }
});

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  try {
    console.log(`Enviando mensagem para ${telefone}: ${texto}`);
    
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
    
    console.log('Resposta do WhatsApp API:', response.status);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor simplificado rodando na porta ${PORT}`);
  console.log(`URL do webhook: http://localhost:${PORT}/webhook`);
  console.log(`Token de verificação: ${VERIFY_TOKEN}`);
  console.log('Para testar, exponha este servidor com Ngrok e configure o webhook do WhatsApp');
});

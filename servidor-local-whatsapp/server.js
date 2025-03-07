/**
 * Servidor local para testar integração WhatsApp com OpenAI
 * Este servidor recebe webhooks do WhatsApp e se comunica diretamente com a OpenAI
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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-3.5-turbo';

// Middleware
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));

// Adicionar rota raiz para verificar se o servidor está rodando
app.get('/', (req, res) => {
  res.send('Servidor de teste WhatsApp + OpenAI está rodando!');
});

// Rota para verificação do webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado!');
    res.status(200).send(challenge);
  } else {
    console.error('Falha na verificação do webhook');
    res.sendStatus(403);
  }
});

// Rota para receber mensagens do webhook
app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));
    
    // Responder imediatamente para evitar timeout
    res.status(200).send('EVENT_RECEIVED');
    
    // Processar a mensagem de forma assíncrona
    processarWebhook(req.body);
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('ERRO');
  }
});

// Função para processar o webhook
async function processarWebhook(body) {
  try {
    // Verificar se é uma mensagem válida
    if (!body.object || !body.entry || !body.entry[0].changes || !body.entry[0].changes[0].value.messages) {
      console.log('Webhook recebido, mas não contém mensagem');
      return;
    }
    
    const mensagem = body.entry[0].changes[0].value.messages[0];
    const telefone = mensagem.from;
    
    // Verificar se é uma mensagem de texto
    if (mensagem.type !== 'text' || !mensagem.text || !mensagem.text.body) {
      console.log('Mensagem recebida não é do tipo texto');
      await enviarMensagemWhatsApp(telefone, 'Por favor, envie uma mensagem de texto.');
      return;
    }
    
    const textoMensagem = mensagem.text.body;
    console.log(`Mensagem recebida de ${telefone}: "${textoMensagem}"`);
    
    try {
      // Processar com OpenAI
      const resposta = await chamarOpenAI(textoMensagem);
      console.log(`Resposta da OpenAI: "${resposta}"`);
      
      // Enviar resposta via WhatsApp
      const sucesso = await enviarMensagemWhatsApp(telefone, resposta);
      
      if (sucesso) {
        console.log('Resposta enviada com sucesso!');
      } else {
        console.error('Falha ao enviar resposta');
        await enviarMensagemWhatsApp(telefone, 'Desculpe, estamos enfrentando problemas técnicos. Por favor, tente novamente mais tarde.');
      }
    } catch (innerError) {
      console.error('Erro ao processar mensagem:', innerError);
      await enviarMensagemWhatsApp(telefone, 'Desculpe, não consegui processar sua mensagem. Por favor, entre em contato pelo telefone (66) 3333-4444.');
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    // Tentar enviar mensagem de erro
    try {
      const telefone = body.entry[0].changes[0].value.messages[0].from;
      await enviarMensagemWhatsApp(telefone, 'Desculpe, estamos enfrentando problemas técnicos. Por favor, tente novamente mais tarde.');
    } catch (e) {
      console.error('Erro ao enviar mensagem de erro:', e);
    }
  }
}

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
    // Formatar o número do telefone
    const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;
    
    console.log(`Enviando mensagem para ${numeroFormatado}: "${texto}"`);
    
    // Garantir que o texto não seja undefined ou null
    if (!texto) {
      texto = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
    
    const message = {
      messaging_product: "whatsapp",
      to: numeroFormatado,
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL do webhook: http://localhost:${PORT}/webhook`);
  console.log('Use ngrok para expor esta URL à internet');
  console.log('Exemplo: ngrok http 3000');
});

/**
 * SOLUÇÃO FINAL PARA INTEGRAÇÃO WHATSAPP + OPENAI
 * Este script combina todas as funcionalidades necessárias em um único arquivo
 * para facilitar a depuração e garantir o funcionamento.
 */
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurações (hardcoded para garantir funcionamento)
const PORT = 3001;
const VERIFY_TOKEN = 'oticadavi2024';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';

// Criar pasta de logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Função para registrar logs
function registrarLog(tipo, mensagem, dados = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    tipo,
    mensagem,
    dados
  };
  
  const logString = JSON.stringify(logEntry, null, 2);
  console.log(`[${timestamp}] [${tipo}] ${mensagem}`);
  
  if (dados) {
    console.log(JSON.stringify(dados, null, 2));
  }
  
  // Salvar log em arquivo
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logString + '\n');
}

// Inicializar servidor Express
const app = express();
app.use(bodyParser.json());

// Rota raiz para verificar se o servidor está rodando
app.get('/', (req, res) => {
  registrarLog('INFO', 'Requisição recebida na rota raiz');
  res.send('Servidor de integração WhatsApp + OpenAI está rodando!');
});

// Rota para verificação do webhook
app.get('/webhook', (req, res) => {
  registrarLog('INFO', 'Requisição de verificação do webhook recebida', req.query);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    registrarLog('SUCCESS', 'Webhook verificado com sucesso');
    res.status(200).send(challenge);
  } else {
    registrarLog('ERROR', 'Falha na verificação do webhook', { mode, token, expectedToken: VERIFY_TOKEN });
    res.sendStatus(403);
  }
});

// Rota para receber mensagens do webhook
app.post('/webhook', async (req, res) => {
  registrarLog('INFO', 'Webhook recebido', req.body);
  
  // Responder imediatamente para evitar timeout
  res.status(200).send('EVENT_RECEIVED');
  
  try {
    const body = req.body;
    
    // Verificar se a estrutura da requisição é válida
    if (!body || !body.object || body.object !== 'whatsapp_business_account') {
      registrarLog('ERROR', 'Estrutura da requisição inválida');
      return;
    }
    
    if (!body.entry || !body.entry[0] || !body.entry[0].changes || !body.entry[0].changes[0] || 
        !body.entry[0].changes[0].value || !body.entry[0].changes[0].value.messages || 
        !body.entry[0].changes[0].value.messages[0]) {
      registrarLog('ERROR', 'Estrutura de mensagem inválida ou mensagem não encontrada');
      return;
    }
    
    // Extrair informações da mensagem
    const mensagem = body.entry[0].changes[0].value.messages[0];
    const telefone = body.entry[0].changes[0].value.contacts[0].wa_id;
    
    registrarLog('INFO', 'Mensagem recebida', { mensagem, telefone });
    
    // Extrair o texto da mensagem
    let textoMensagem = '';
    if (mensagem.type === 'text' && mensagem.text && mensagem.text.body) {
      textoMensagem = mensagem.text.body;
    } else if (mensagem.type === 'interactive' && mensagem.interactive.type === 'button_reply') {
      textoMensagem = mensagem.interactive.button_reply.title;
    } else {
      textoMensagem = 'Mensagem não reconhecida';
    }
    
    registrarLog('INFO', 'Texto da mensagem', { textoMensagem });
    
    // Processar a mensagem com OpenAI
    try {
      registrarLog('INFO', 'Processando mensagem com OpenAI');
      const respostaIA = await chamarOpenAI(textoMensagem);
      registrarLog('SUCCESS', 'Resposta da OpenAI recebida', { respostaIA });
      
      // Enviar resposta para o WhatsApp
      await enviarMensagemWhatsApp(telefone, respostaIA);
      registrarLog('SUCCESS', 'Resposta enviada com sucesso');
    } catch (openaiError) {
      registrarLog('ERROR', 'Erro ao processar mensagem com OpenAI', openaiError);
      
      // Enviar mensagem de erro
      const mensagemErro = 'Desculpe, estamos com problemas técnicos no momento. Por favor, tente novamente mais tarde ou entre em contato pelo telefone (66) 3333-4444.';
      await enviarMensagemWhatsApp(telefone, mensagemErro);
      registrarLog('INFO', 'Mensagem de erro enviada');
    }
  } catch (error) {
    registrarLog('ERROR', 'Erro ao processar webhook', error);
  }
});

// Função para chamar a OpenAI
async function chamarOpenAI(mensagem) {
  registrarLog('INFO', 'Chamando OpenAI', { mensagem });
  
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
    
    registrarLog('INFO', 'Resposta da OpenAI recebida', { status: response.status });
    
    // Verificar se a resposta é válida
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Resposta inválida da API da OpenAI');
    }
    
    // Extrair a resposta
    const resposta = response.data.choices[0].message.content;
    registrarLog('INFO', 'Resposta processada', { resposta });
    
    return resposta;
  } catch (error) {
    registrarLog('ERROR', 'Erro ao chamar OpenAI', error);
    
    if (error.response) {
      registrarLog('ERROR', 'Detalhes do erro da API', { 
        status: error.response.status, 
        data: error.response.data 
      });
    }
    
    throw error;
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  registrarLog('INFO', 'Enviando mensagem WhatsApp', { telefone, texto });
  
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
    
    registrarLog('SUCCESS', 'Mensagem WhatsApp enviada', { 
      status: response.status, 
      data: response.data 
    });
    
    return response.data;
  } catch (error) {
    registrarLog('ERROR', 'Erro ao enviar mensagem WhatsApp', error);
    
    if (error.response) {
      registrarLog('ERROR', 'Detalhes do erro da API', { 
        status: error.response.status, 
        data: error.response.data 
      });
    }
    
    throw error;
  }
}

// Iniciar servidor
app.listen(PORT, () => {
  registrarLog('INFO', `Servidor iniciado na porta ${PORT}`);
  registrarLog('INFO', `URL do webhook: http://localhost:${PORT}/webhook`);
  registrarLog('INFO', `Token de verificação: ${VERIFY_TOKEN}`);
  registrarLog('INFO', 'Para testar, exponha este servidor com Ngrok e configure o webhook do WhatsApp');
});

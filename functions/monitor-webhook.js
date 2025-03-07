/**
 * Script para monitorar e debugar o webhook do WhatsApp
 * Este script mostra exatamente o que acontece quando uma mensagem é recebida
 */
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Configurações
const app = express();
const PORT = 3000;
const VERIFY_TOKEN = 'oticadavi2024';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';

// Middleware
app.use(bodyParser.json());

// Log detalhado de todas as requisições
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log('\n' + '='.repeat(50));
  console.log(`[${timestamp}] NOVA REQUISIÇÃO`);
  console.log('='.repeat(50));
  
  console.log('\nINFORMAÇÕES DA REQUISIÇÃO:');
  console.log('- Método:', req.method);
  console.log('- URL:', req.url);
  console.log('- Query:', JSON.stringify(req.query, null, 2));
  console.log('- Headers:', JSON.stringify(req.headers, null, 2));
  console.log('- Body:', JSON.stringify(req.body, null, 2));
  
  // Salvar o início do processamento
  req.startTime = Date.now();
  
  // Capturar a resposta
  const oldSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    console.log('\nRESPOSTA ENVIADA:');
    console.log('- Status:', res.statusCode);
    console.log('- Tempo:', duration + 'ms');
    console.log('- Dados:', data);
    
    oldSend.apply(res, arguments);
  };
  
  next();
});

// Rota de verificação do webhook
app.get('/webhook', (req, res) => {
  console.log('\nPROCESSANDO VERIFICAÇÃO DO WEBHOOK:');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('- Mode:', mode);
  console.log('- Token:', token);
  console.log('- Challenge:', challenge);
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Verificação bem-sucedida');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verificação falhou');
    res.sendStatus(403);
  }
});

// Função para enviar resposta via WhatsApp
async function enviarResposta(telefone, texto) {
  try {
    console.log('\nENVIANDO RESPOSTA:');
    console.log('- Telefone:', telefone);
    console.log('- Texto:', texto);
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: { body: texto }
    };
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log('✅ Resposta enviada com sucesso');
    console.log('- ID da mensagem:', response.data.messages[0].id);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar resposta:');
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Erro:', error.response.data);
    } else {
      console.error('- Erro:', error.message);
    }
    return false;
  }
}

// Rota para receber mensagens
app.post('/webhook', async (req, res) => {
  console.log('\nPROCESSANDO MENSAGEM RECEBIDA:');
  
  try {
    // 1. Validar a estrutura da mensagem
    if (!req.body.object || !req.body.entry || !req.body.entry[0].changes) {
      throw new Error('Estrutura da mensagem inválida');
    }
    
    const change = req.body.entry[0].changes[0];
    
    // 2. Validar se é uma mensagem do WhatsApp
    if (change.field !== 'messages' || !change.value || !change.value.messages) {
      throw new Error('Não é uma mensagem do WhatsApp');
    }
    
    const mensagem = change.value.messages[0];
    const metadata = change.value.metadata;
    
    // 3. Extrair informações da mensagem
    console.log('\nDETALHES DA MENSAGEM:');
    console.log('- ID:', mensagem.id);
    console.log('- Tipo:', mensagem.type);
    console.log('- De:', mensagem.from);
    console.log('- Timestamp:', new Date(mensagem.timestamp * 1000).toLocaleString());
    
    if (mensagem.type === 'text' && mensagem.text) {
      console.log('- Texto:', mensagem.text.body);
      
      // 4. Gerar resposta
      const resposta = 'Recebemos sua mensagem: "' + mensagem.text.body + '". Em breve um atendente entrará em contato.';
      
      // 5. Enviar resposta
      await enviarResposta(mensagem.from, resposta);
    }
    
    // 6. Responder ao webhook
    res.status(200).send('EVENT_RECEIVED');
    
    console.log('\n✅ Mensagem processada com sucesso');
  } catch (error) {
    console.error('\n❌ ERRO NO PROCESSAMENTO:');
    console.error('- Mensagem:', error.message);
    console.error('- Body recebido:', JSON.stringify(req.body, null, 2));
    
    // Sempre retornar 200 para o WhatsApp
    res.status(200).send('EVENT_RECEIVED');
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('MONITOR DE WEBHOOK INICIADO');
  console.log('='.repeat(50));
  console.log('\nConfiguração:');
  console.log('- Porta:', PORT);
  console.log('- URL:', `http://localhost:${PORT}/webhook`);
  console.log('- Token:', VERIFY_TOKEN);
  console.log('\nAguardando mensagens...');
});

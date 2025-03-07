/**
 * Script para depurar o recebimento de mensagens do WhatsApp
 * Este script simula o recebimento de uma mensagem e mostra todos os detalhes
 */
const express = require('express');
const bodyParser = require('body-parser');

// Configurações
const app = express();
const PORT = 3000;
const VERIFY_TOKEN = 'oticadavi2024';

// Middleware
app.use(bodyParser.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log('\n=== NOVA REQUISIÇÃO ===');
  console.log('Data/Hora:', new Date().toLocaleString());
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Rota de verificação
app.get('/webhook', (req, res) => {
  console.log('\n=== VERIFICAÇÃO DO WEBHOOK ===');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Challenge:', challenge);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado com sucesso');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Falha na verificação do webhook');
    res.sendStatus(403);
  }
});

// Rota para receber mensagens
app.post('/webhook', (req, res) => {
  console.log('\n=== MENSAGEM RECEBIDA ===');
  
  try {
    // Validar a estrutura da mensagem
    if (!req.body.object || !req.body.entry || !req.body.entry[0].changes) {
      throw new Error('Estrutura da mensagem inválida');
    }

    const changes = req.body.entry[0].changes[0];
    
    // Validar se é uma mensagem do WhatsApp
    if (changes.field !== 'messages' || !changes.value || !changes.value.messages) {
      throw new Error('Não é uma mensagem do WhatsApp');
    }

    const mensagem = changes.value.messages[0];
    const metadata = changes.value.metadata;
    
    console.log('\nDetalhes da mensagem:');
    console.log('- ID:', mensagem.id);
    console.log('- Tipo:', mensagem.type);
    console.log('- De:', mensagem.from);
    console.log('- Timestamp:', new Date(mensagem.timestamp * 1000).toLocaleString());
    
    if (mensagem.type === 'text' && mensagem.text) {
      console.log('- Texto:', mensagem.text.body);
    }
    
    console.log('\nMetadados:');
    console.log('- Número do telefone:', metadata.display_phone_number);
    console.log('- ID do telefone:', metadata.phone_number_id);
    
    // Responder imediatamente
    res.status(200).send('EVENT_RECEIVED');
    
    console.log('\n✅ Mensagem processada com sucesso');
  } catch (error) {
    console.error('\n❌ Erro ao processar mensagem:', error.message);
    console.error('Body recebido:', JSON.stringify(req.body, null, 2));
    res.status(200).send('EVENT_RECEIVED'); // Sempre retornar 200 para o WhatsApp
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`\n=== SERVIDOR DE DEBUG INICIADO ===`);
  console.log(`Porta: ${PORT}`);
  console.log(`URL do webhook: http://localhost:${PORT}/webhook`);
  console.log(`Token de verificação: ${VERIFY_TOKEN}`);
  console.log('\nAguardando mensagens...');
});

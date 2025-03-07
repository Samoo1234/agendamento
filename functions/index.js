const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const express = require('express');
const cors = require('cors')({ origin: true });
const { processarMensagemComIA } = require('./services/openaiService');

// Inicializa o app do Firebase Admin e Express
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors);
app.use(express.json());

/**
 * Cloud Function para enviar mensagem de confirmação via WhatsApp
 * Esta função é chamada diretamente do frontend quando um agendamento é criado
 */
exports.sendWhatsAppConfirmation = functions.https.onCall(async (data, context) => {
  try {
    // Configurações do WhatsApp Business API
    const token = process.env.WHATSAPP_TOKEN || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || "576714648854724";
    const version = 'v22.0';
    
    // Extrai os dados do agendamento
    const { telefone, nome, data, horario, cidade } = data;
    
    if (!telefone || !nome || !data || !horario) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Dados incompletos para envio da mensagem'
      );
    }
    
    // Formata a mensagem de acordo com o template aprovado
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "template",
      template: {
        name: "template_agendamento",
        language: {
          code: "pt_BR"
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: nome },
              { type: "text", text: data },
              { type: "text", text: horario },
              { type: "text", text: cidade || "Não especificada" }
            ]
          }
        ]
      }
    };
    
    // Envia a mensagem
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    
    // Registra o envio no Firestore para histórico
    await admin.firestore().collection('notificacoes').add({
      tipo: 'confirmacao',
      telefone,
      nome,
      data,
      horario,
      cidade,
      status: 'enviado',
      resposta: response.data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Retorna o resultado para o cliente
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    
    // Registra o erro no Firestore
    await admin.firestore().collection('notificacoes').add({
      tipo: 'confirmacao',
      status: 'erro',
      erro: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError(
      'internal', 
      `Erro ao enviar mensagem: ${error.message}`
    );
  }
});

/**
 * Cloud Function para enviar lembrete via WhatsApp
 * Esta função pode ser chamada manualmente ou agendada
 */
exports.sendWhatsAppReminder = functions.https.onCall(async (data, context) => {
  try {
    // Configurações do WhatsApp Business API
    const token = process.env.WHATSAPP_TOKEN || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || "576714648854724";
    const version = 'v22.0';
    
    // Extrai os dados do agendamento
    const { telefone, nome, data, horario, cidade } = data;
    
    if (!telefone || !nome || !data || !horario) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Dados incompletos para envio do lembrete'
      );
    }
    
    // Formata a mensagem de acordo com o template aprovado
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "template",
      template: {
        name: "template_lembrete",
        language: {
          code: "pt_BR"
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: nome },
              { type: "text", text: data },
              { type: "text", text: horario },
              { type: "text", text: cidade || "Não especificada" }
            ]
          }
        ]
      }
    };
    
    // Envia a mensagem
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    
    // Registra o envio no Firestore para histórico
    await admin.firestore().collection('notificacoes').add({
      tipo: 'lembrete',
      telefone,
      nome,
      data,
      horario,
      cidade,
      status: 'enviado',
      resposta: response.data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Retorna o resultado para o cliente
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao enviar lembrete WhatsApp:', error);
    
    // Registra o erro no Firestore
    await admin.firestore().collection('notificacoes').add({
      tipo: 'lembrete',
      status: 'erro',
      erro: error.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError(
      'internal', 
      `Erro ao enviar lembrete: ${error.message}`
    );
  }
});

/**
 * Função agendada para enviar lembretes automáticos um dia antes do agendamento
 * Esta função é executada diariamente às 10:00 da manhã
 */
exports.sendDailyReminders = functions.pubsub.schedule('0 10 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      // Calcula a data de amanhã
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      
      // Formata a data para o formato YYYY-MM-DD
      const dataAmanha = amanha.toISOString().split('T')[0];
      
      // Busca todos os agendamentos para amanhã
      const agendamentosRef = admin.firestore().collection('agendamentos');
      const snapshot = await agendamentosRef.where('data', '==', dataAmanha).get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento encontrado para amanhã:', dataAmanha);
        return null;
      }
      
      // Envia lembretes para cada agendamento
      const promises = [];
      snapshot.forEach(doc => {
        const agendamento = doc.data();
        
        // Verifica se tem telefone
        if (!agendamento.telefone) {
          console.log('Agendamento sem telefone:', doc.id);
          return;
        }
        
        // Formata o telefone
        const telefoneFormatado = agendamento.telefone.replace(/[\s\-\(\)]/g, '');
        const numeroCompleto = telefoneFormatado.startsWith('55') 
          ? telefoneFormatado 
          : `55${telefoneFormatado}`;
        
        // Chama a função de envio de lembrete
        const promise = exports.sendWhatsAppReminder({
          telefone: numeroCompleto,
          nome: agendamento.nome,
          data: new Date(agendamento.data).toLocaleDateString('pt-BR'),
          horario: agendamento.horario,
          cidade: agendamento.cidade
        }, { auth: true });
        
        promises.push(promise);
      });
      
      await Promise.all(promises);
      console.log(`Lembretes enviados para ${promises.length} agendamentos`);
      return null;
    } catch (error) {
      console.error('Erro ao enviar lembretes diários:', error);
      return null;
    }
});

// Função auxiliar para enviar mensagem
async function enviarMensagem(para, texto) {
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v17.0/576714648854724/messages`,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: para,
        type: 'text',
        text: { body: texto }
      }
    });
    console.log('Mensagem enviada com sucesso para:', para);
  } catch (erro) {
    console.error('Erro ao enviar mensagem:', erro);
    throw erro;
  }
}

// Rota GET para verificação do webhook
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'oticadavi2024') {
    console.log('Webhook verificado!');
    res.status(200).send(challenge);
  } else {
    console.error('Falha na verificação');
    res.sendStatus(403);
  }
});

// Rota POST para receber mensagens
app.post('/', async (req, res) => {
  console.log('Payload completo recebido:', JSON.stringify(req.body, null, 2));
  
  try {
    if (req.body.object === 'whatsapp_business_account') {
      const entry = req.body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      if (value.messages && value.messages[0]) {
        const mensagem = value.messages[0];
        const telefone = mensagem.from;
        
        const resposta = await processarMensagem(mensagem);
        if (resposta) {
          await enviarMensagem(telefone, resposta);
        }
      }
    }
    res.sendStatus(200);
  } catch (erro) {
    console.error('Erro ao processar webhook:', erro);
    res.sendStatus(500);
  }
});

// Função para corrigir o nome da cidade em todos os registros
exports.corrigirFormatacaoCidade = functions.https.onRequest(async (req, res) => {
  try {
    const agendamentosRef = admin.firestore().collection('agendamentos');
    const snapshot = await agendamentosRef.where('cidade', '==', 'Central De Minas').get();
    
    const batch = admin.firestore().batch();
    
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        cidade: 'Central de Minas'
      });
    });
    
    await batch.commit();
    
    res.json({ success: true, message: `Corrigidos ${snapshot.size} registros` });
  } catch (error) {
    console.error('Erro ao corrigir registros:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.webhook = functions.https.onRequest(app);

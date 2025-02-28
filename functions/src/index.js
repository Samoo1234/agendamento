const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

// Inicializa o app do Firebase Admin
admin.initializeApp();

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
        name: "template_agendamento", // Certifique-se que este template existe e está aprovado
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
        name: "template_lembrete", // Certifique-se que este template existe e está aprovado
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

// Função HTTP específica para o webhook do WhatsApp
exports.whatsappWebhookHandler = functions.https.onRequest((req, res) => {
  console.log('Recebida solicitação no webhook do WhatsApp');
  console.log('Método:', req.method);
  console.log('Query:', req.query);
  
  if (req.method === 'GET') {
    // Verificação do webhook pelo WhatsApp
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('Modo:', mode);
    console.log('Token:', token);
    console.log('Challenge:', challenge);
    
    const verifyToken = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verificado com sucesso');
      res.status(200).send(challenge);
    } else {
      console.log('Falha na verificação do webhook');
      res.status(403).send('Forbidden');
    }
  } else if (req.method === 'POST') {
    // Processamento de mensagens
    console.log('Corpo da solicitação:', req.body);
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.status(405).send('Method Not Allowed');
  }
});

// Função HTTP simples para teste
exports.testeWebhook = functions.https.onRequest((req, res) => {
  res.status(200).send('Função de teste funcionando!');
});

// Exporta a função de notificação existente
const whatsappNotification = require('./whatsappNotification');
exports.sendWhatsAppConfirmationOnCreate = whatsappNotification.sendWhatsAppConfirmation;

// Importa e exporta as funções do sistema de confirmação
const confirmationSystem = require('./confirmationSystem');
exports.sendConfirmationRequests = confirmationSystem.sendConfirmationRequests;
exports.whatsAppWebhook = confirmationSystem.processWhatsAppWebhook;
exports.updateConfirmationStatus = confirmationSystem.updateConfirmationStatus;
exports.initConfirmationStatus = confirmationSystem.initConfirmationStatus;

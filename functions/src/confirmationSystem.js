const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

/**
 * Função agendada para enviar solicitações de confirmação 24h antes do agendamento
 * Esta função é executada diariamente às 10:00 da manhã
 */
exports.sendConfirmationRequests = functions.pubsub.schedule('0 10 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      // Configurações do WhatsApp Business API
      const token = functions.config().whatsapp?.token || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
      const phoneNumberId = functions.config().whatsapp?.phone_id || "576714648854724";
      const version = 'v21.0';
      
      // Calcula a data de amanhã
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      
      // Formata a data para o formato YYYY-MM-DD
      const dataAmanha = amanha.toISOString().split('T')[0];
      
      // Busca todos os agendamentos para amanhã
      const agendamentosRef = admin.firestore().collection('agendamentos');
      const snapshot = await agendamentosRef
        .where('data', '==', dataAmanha)
        .where('status_confirmacao', '==', 'pendente')
        .get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento pendente encontrado para amanhã:', dataAmanha);
        return null;
      }
      
      // Envia solicitações de confirmação para cada agendamento
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
        
        // Formata a data para exibição
        const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR');
        
        // Formata a mensagem com template
        const message = {
          messaging_product: "whatsapp",
          to: numeroCompleto,
          type: "template",
          template: {
            name: "confirmacao_agendamento",
            language: {
              code: "pt_BR"
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: agendamento.nome || "Cliente" },
                  { type: "text", text: dataFormatada || "Data não especificada" },
                  { type: "text", text: agendamento.horario || "Horário não especificado" },
                  { type: "text", text: agendamento.cidade || "Não especificada" }
                ]
              }
            ]
          }
        };
        
        // Envia a mensagem
        const promise = axios({
          method: "POST",
          url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
          data: message,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }).then(async (response) => {
          // Atualiza o documento com o ID da mensagem
          await doc.ref.update({
            confirmacao_solicitada: true,
            confirmacao_timestamp: admin.firestore.FieldValue.serverTimestamp(),
            confirmacao_mensagem_id: response.data.messages?.[0]?.id || null
          });
          return response;
        });
        
        promises.push(promise);
      });
      
      await Promise.all(promises);
      console.log(`Solicitações de confirmação enviadas para ${promises.length} agendamentos`);
      return null;
    } catch (error) {
      console.error('Erro ao enviar solicitações de confirmação:', error);
      return null;
    }
  });

/**
 * Webhook para processar respostas de confirmação do WhatsApp
 */
exports.processWhatsAppWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Verifica o método da requisição
    if (req.method === 'GET') {
      // Verificação do webhook pelo WhatsApp
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      // Verifica se o token é válido (deve ser configurado no painel do WhatsApp)
      const verifyToken = functions.config().whatsapp?.verify_token || 'token_secreto_para_verificacao';
      
      console.log('Verificando webhook - Mode:', mode, 'Token recebido:', token, 'Token esperado:', verifyToken);
      
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verificado com sucesso');
        res.status(200).send(challenge);
        return;
      } else {
        console.error('Falha na verificação do webhook. Token recebido:', token, 'Token esperado:', verifyToken);
        res.status(403).send('Verificação falhou');
        return;
      }
    }
    
    // Processa as mensagens recebidas (POST)
    const body = req.body;
    
    // Verifica se é uma mensagem do WhatsApp
    if (!body.object || !body.entry || !body.entry[0].changes || !body.entry[0].changes[0].value.messages) {
      console.log('Requisição não contém mensagem do WhatsApp');
      res.status(200).send('OK');
      return;
    }
    
    // Extrai a mensagem
    const message = body.entry[0].changes[0].value.messages[0];
    const telefone = body.entry[0].changes[0].value.contacts[0].wa_id;
    
    console.log('Mensagem recebida:', JSON.stringify(message));
    
    // Processa a resposta baseada no conteúdo da mensagem
    try {
      // Busca agendamentos pendentes para este número de telefone
      const telefoneFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;
      const agendamentosRef = admin.firestore().collection('agendamentos');
      const snapshot = await agendamentosRef
        .where('telefone', '==', telefoneFormatado)
        .where('status_confirmacao', '==', 'pendente')
        .get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento pendente encontrado para o número:', telefoneFormatado);
        res.status(200).send('OK');
        return;
      }
      
      // Pega o agendamento mais próximo (geralmente será o de amanhã)
      let agendamentoMaisProximo = null;
      let dataMaisProxima = null;
      
      snapshot.forEach(doc => {
        const agendamento = doc.data();
        const dataAgendamento = new Date(agendamento.data + 'T00:00:00');
        
        if (!dataMaisProxima || dataAgendamento < dataMaisProxima) {
          dataMaisProxima = dataAgendamento;
          agendamentoMaisProximo = {
            id: doc.id,
            ...agendamento
          };
        }
      });
      
      if (!agendamentoMaisProximo) {
        console.log('Não foi possível determinar o agendamento mais próximo');
        res.status(200).send('OK');
        return;
      }
      
      // Determina se é uma confirmação ou cancelamento
      let isConfirmation = false;
      let isCancellation = false;
      
      // Verifica se é uma resposta interativa (botão)
      if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
        const buttonId = message.interactive.button_reply.id;
        const buttonText = message.interactive.button_reply.title;
        
        console.log('Resposta de botão recebida:', buttonId, buttonText);
        
        isConfirmation = buttonId === 'yes' || buttonId === 'sim' || buttonText.toLowerCase() === 'sim';
        isCancellation = buttonId === 'no' || buttonId === 'nao' || buttonId === 'não' || buttonText.toLowerCase() === 'não';
      } 
      // Verifica se é uma resposta de texto
      else if (message.type === 'text' && message.text && message.text.body) {
        const messageText = message.text.body.toLowerCase();
        
        isConfirmation = messageText.includes('sim') || 
                         messageText.includes('confirmo') || 
                         messageText.includes('confirmar');
        isCancellation = messageText.includes('não') || 
                         messageText.includes('nao') ||
                         messageText.includes('cancelo') || 
                         messageText.includes('cancelar');
      }
      
      const agendamentoRef = admin.firestore().collection('agendamentos').doc(agendamentoMaisProximo.id);
      
      if (isConfirmation) {
        // Confirma o agendamento
        await agendamentoRef.update({
          status_confirmacao: 'confirmado',
          confirmacao_resposta_timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Envia mensagem de confirmação
        await enviarMensagemSimples(
          telefone, 
          `Obrigado por confirmar seu agendamento. Esperamos você!`
        );
        
        console.log('Agendamento confirmado:', agendamentoMaisProximo.id);
      } else if (isCancellation) {
        // Cancela o agendamento
        await agendamentoRef.update({
          status_confirmacao: 'cancelado',
          confirmacao_resposta_timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Envia mensagem de cancelamento
        await enviarMensagemSimples(
          telefone, 
          `Seu agendamento foi cancelado. Se desejar reagendar, entre em contato conosco.`
        );
        
        console.log('Agendamento cancelado:', agendamentoMaisProximo.id);
      } else {
        // Resposta não reconhecida
        await enviarMensagemSimples(
          telefone, 
          `Não entendemos sua resposta. Por favor, responda com "Sim" para confirmar ou "Não" para cancelar seu agendamento.`
        );
        
        console.log('Resposta não reconhecida para o agendamento:', agendamentoMaisProximo.id);
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('Erro interno');
  }
});

/**
 * Função auxiliar para enviar mensagem simples via WhatsApp
 */
async function enviarMensagemSimples(telefone, texto) {
  try {
    const token = functions.config().whatsapp?.token || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = functions.config().whatsapp?.phone_id || "576714648854724";
    const version = 'v21.0';
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: {
        body: texto
      }
    };
    
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem simples:', error);
    return false;
  }
}

/**
 * Função para atualizar status de confirmação de agendamentos antigos
 * Esta função é executada uma vez por dia para marcar como "pendente" agendamentos sem status
 */
exports.updateConfirmationStatus = functions.pubsub.schedule('0 0 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      // Busca agendamentos sem status de confirmação
      const agendamentosRef = admin.firestore().collection('agendamentos');
      const snapshot = await agendamentosRef
        .where('status_confirmacao', '==', null)
        .get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento sem status de confirmação encontrado');
        return null;
      }
      
      // Atualiza o status para "pendente"
      const batch = admin.firestore().batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { status_confirmacao: 'pendente' });
      });
      
      await batch.commit();
      console.log(`Status de confirmação atualizado para ${snapshot.size} agendamentos`);
      return null;
    } catch (error) {
      console.error('Erro ao atualizar status de confirmação:', error);
      return null;
    }
  });

// Função para inicializar o status de confirmação em novos agendamentos
exports.initConfirmationStatus = functions.firestore
  .document('agendamentos/{agendamentoId}')
  .onCreate(async (snap, context) => {
    try {
      // Define o status de confirmação como "pendente" para novos agendamentos
      await snap.ref.update({
        status_confirmacao: 'pendente'
      });
      
      return null;
    } catch (error) {
      console.error('Erro ao inicializar status de confirmação:', error);
      return null;
    }
  });

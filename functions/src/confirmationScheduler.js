const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

/**
 * Função programada para enviar mensagens de confirmação 24 horas antes dos agendamentos
 * Esta função é executada todos os dias às 10:00 (horário de Brasília)
 */
exports.sendConfirmationRequests = functions.pubsub.schedule('0 10 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      console.log('Iniciando envio de mensagens de confirmação...');
      
      // Configurações do WhatsApp Business API
      const token = process.env.WHATSAPP_TOKEN || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
      const phoneNumberId = process.env.WHATSAPP_PHONE_ID || "576714648854724";
      const version = 'v22.0';
      
      // Calcular a data de amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Calcular o final do dia de amanhã
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);
      
      // Formatar a data para consulta no Firestore
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
      
      console.log(`Buscando agendamentos para: ${tomorrowFormatted}`);
      
      // Buscar agendamentos para amanhã
      const snapshot = await admin.firestore()
        .collection('agendamentos')
        .where('data', '>=', tomorrow)
        .where('data', '<=', tomorrowEnd)
        .get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento encontrado para amanhã.');
        return null;
      }
      
      console.log(`Encontrados ${snapshot.size} agendamentos para amanhã.`);
      
      // Contador de mensagens enviadas
      let sentCount = 0;
      let errorCount = 0;
      
      // Processar cada agendamento
      for (const doc of snapshot.docs) {
        try {
          const agendamento = doc.data();
          
          // Verificar se já foi enviada uma mensagem de confirmação
          if (agendamento.status_confirmacao === 'enviado') {
            console.log(`Agendamento ${doc.id} já teve mensagem de confirmação enviada. Pulando.`);
            continue;
          }
          
          // Formatar a data e o horário
          const dataFormatada = agendamento.data.toDate().toLocaleDateString('pt-BR');
          const horarioFormatado = agendamento.horario;
          
          console.log(`Enviando mensagem de confirmação para: ${agendamento.nome} (${agendamento.telefone})`);
          
          // Preparar a mensagem usando o template de confirmação
          const message = {
            messaging_product: "whatsapp",
            to: agendamento.telefone,
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
                    { type: "text", text: agendamento.nome },
                    { type: "text", text: dataFormatada },
                    { type: "text", text: horarioFormatado },
                    { type: "text", text: agendamento.cidade || "Não especificada" }
                  ]
                }
              ]
            }
          };
          
          // Enviar a mensagem
          const response = await axios({
            method: "POST",
            url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
            data: message,
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });
          
          // Atualizar o status de confirmação no Firestore
          await admin.firestore().collection('agendamentos').doc(doc.id).update({
            status_confirmacao: 'enviado',
            data_envio_confirmacao: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Registrar o envio no Firestore para histórico
          await admin.firestore().collection('notificacoes').add({
            tipo: 'confirmacao',
            agendamento_id: doc.id,
            telefone: agendamento.telefone,
            nome: agendamento.nome,
            data: dataFormatada,
            horario: horarioFormatado,
            cidade: agendamento.cidade || "Não especificada",
            status: 'enviado',
            resposta: response.data,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          
          sentCount++;
          console.log(`Mensagem enviada com sucesso para: ${agendamento.nome}`);
        } catch (error) {
          errorCount++;
          console.error(`Erro ao enviar mensagem para agendamento ${doc.id}:`, error);
          
          // Registrar o erro no Firestore
          await admin.firestore().collection('notificacoes').add({
            tipo: 'confirmacao',
            agendamento_id: doc.id,
            status: 'erro',
            erro: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      console.log(`Processo concluído. Mensagens enviadas: ${sentCount}, Erros: ${errorCount}`);
      return { sent: sentCount, errors: errorCount };
    } catch (error) {
      console.error('Erro ao processar envio de mensagens de confirmação:', error);
      return null;
    }
  });

/**
 * Função para inicializar o campo status_confirmacao em todos os agendamentos
 * Esta função deve ser executada uma única vez para preparar os documentos existentes
 */
exports.initConfirmationStatus = functions.https.onCall(async (data, context) => {
  try {
    // Verificar se o usuário tem permissão de administrador
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied', 
        'Apenas administradores podem executar esta função'
      );
    }
    
    console.log('Inicializando status de confirmação para agendamentos existentes...');
    
    // Buscar todos os agendamentos que não têm o campo status_confirmacao
    const snapshot = await admin.firestore()
      .collection('agendamentos')
      .where('status_confirmacao', '==', null)
      .get();
    
    if (snapshot.empty) {
      console.log('Nenhum agendamento encontrado sem status de confirmação.');
      return { updated: 0 };
    }
    
    console.log(`Encontrados ${snapshot.size} agendamentos para atualizar.`);
    
    // Contador de documentos atualizados
    let updatedCount = 0;
    
    // Processar cada agendamento
    const batch = admin.firestore().batch();
    for (const doc of snapshot.docs) {
      batch.update(doc.ref, {
        status_confirmacao: 'pendente'
      });
      updatedCount++;
    }
    
    // Executar o batch
    await batch.commit();
    
    console.log(`${updatedCount} agendamentos atualizados com sucesso.`);
    return { updated: updatedCount };
  } catch (error) {
    console.error('Erro ao inicializar status de confirmação:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Função para atualizar o status de confirmação de um agendamento
 * Esta função é chamada pelo webhook quando recebe uma resposta do cliente
 */
exports.updateConfirmationStatus = async (agendamentoId, status) => {
  try {
    console.log(`Atualizando status de confirmação para agendamento ${agendamentoId}: ${status}`);
    
    // Verificar se o agendamento existe
    const agendamentoRef = admin.firestore().collection('agendamentos').doc(agendamentoId);
    const doc = await agendamentoRef.get();
    
    if (!doc.exists) {
      console.error(`Agendamento ${agendamentoId} não encontrado.`);
      return false;
    }
    
    // Se o status for 'cancelado', excluir o agendamento
    if (status === 'cancelado') {
      // Primeiro, salvar uma cópia do agendamento na coleção 'agendamentos_cancelados'
      await admin.firestore().collection('agendamentos_cancelados').doc(agendamentoId).set({
        ...doc.data(),
        data_cancelamento: admin.firestore.FieldValue.serverTimestamp(),
        motivo_cancelamento: 'Cancelado pelo cliente via WhatsApp'
      });
      
      // Depois, excluir o agendamento
      await agendamentoRef.delete();
      
      console.log(`Agendamento ${agendamentoId} cancelado e excluído.`);
      return true;
    }
    
    // Se o status for 'confirmado', atualizar o status
    await agendamentoRef.update({
      status_confirmacao: status,
      data_confirmacao: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Status de confirmação atualizado para: ${status}`);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar status de confirmação para agendamento ${agendamentoId}:`, error);
    return false;
  }
};

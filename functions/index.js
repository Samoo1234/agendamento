const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

// Função para enviar mensagem via WhatsApp
async function sendWhatsAppMessage(phoneNumber, message) {
  const config = functions.config();
  const whatsappToken = config.whatsapp.token;
  const phoneNumberId = config.whatsapp.phone_id;

  if (!whatsappToken || !phoneNumberId) {
    console.error('Configurações ausentes:', { whatsappToken: !!whatsappToken, phoneNumberId: !!phoneNumberId });
    throw new Error('Configurações do WhatsApp não encontradas');
  }

  // Log do número de telefone antes do envio
  console.log('Tentando enviar mensagem para:', phoneNumber);
  
  try {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    console.log('URL da requisição:', url);
    
    const body = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message }
    };
    
    console.log('Corpo da requisição:', JSON.stringify(body));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(`Erro na API do WhatsApp: ${data.error?.message || 'Erro desconhecido'}`);
    }

    console.log('Resposta completa da API:', data);
    return data;
  } catch (error) {
    console.error('Erro detalhado ao enviar mensagem:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Função para formatar o número de telefone
function formatPhoneNumber(phone) {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Se já começar com 55, remove para não duplicar
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.substring(2);
  }
  
  // Adiciona o +55
  return `+55${cleaned}`;
}

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Verificar se o chamador é um administrador
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  try {
    // Buscar o role do usuário no Firestore
    const callerDoc = await admin.firestore().collection('usuarios').doc(context.auth.uid).get();
    const callerData = callerDoc.data();

    if (!callerData || callerData.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem deletar usuários');
    }

    // Verificar se o UID foi fornecido
    if (!data.uid) {
      throw new functions.https.HttpsError('invalid-argument', 'UID do usuário não fornecido');
    }

    // Deletar o usuário do Authentication
    await admin.auth().deleteUser(data.uid);

    return { success: true, message: 'Usuário deletado com sucesso' };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao deletar usuário: ' + error.message);
  }
});

// Cloud Function acionada quando um novo agendamento é criado
exports.onAgendamentoCriado = functions.firestore
  .document('agendamentos/{agendamentoId}')
  .onCreate(async (snap, context) => {
    try {
      const agendamento = snap.data();
      const userDoc = await admin.firestore().collection('usuarios').doc(agendamento.userId).get();
      const userData = userDoc.data();

      if (!userData.phoneNumber) {
        console.log('Usuário não tem número de telefone cadastrado');
        return;
      }

      const message = `Olá ${userData.name}! 
Seu agendamento foi confirmado para ${agendamento.data} às ${agendamento.hora}.
Local: ${agendamento.local}
Serviço: ${agendamento.servico}`;

      await sendWhatsAppMessage(userData.phoneNumber, message);
    } catch (error) {
      console.error('Erro ao processar novo agendamento:', error);
    }
  });

// Cloud Function acionada quando um agendamento é atualizado
exports.onAgendamentoAtualizado = functions.firestore
  .document('agendamentos/{agendamentoId}')
  .onUpdate(async (change, context) => {
    try {
      const newData = change.after.data();
      const oldData = change.before.data();

      // Verifica se houve mudança relevante
      if (newData.data === oldData.data && 
          newData.hora === oldData.hora && 
          newData.status === oldData.status) {
        return;
      }

      const userDoc = await admin.firestore().collection('usuarios').doc(newData.userId).get();
      const userData = userDoc.data();

      if (!userData.phoneNumber) {
        console.log('Usuário não tem número de telefone cadastrado');
        return;
      }

      let message = `Olá ${userData.name}! `;
      
      if (newData.status !== oldData.status) {
        message += `\nSeu agendamento teve o status atualizado para: ${newData.status}`;
      }
      
      if (newData.data !== oldData.data || newData.hora !== oldData.hora) {
        message += `\nNova data/hora: ${newData.data} às ${newData.hora}`;
      }

      message += `\nLocal: ${newData.local}\nServiço: ${newData.servico}`;

      await sendWhatsAppMessage(userData.phoneNumber, message);
    } catch (error) {
      console.error('Erro ao processar atualização do agendamento:', error);
    }
  });

// Cloud Function para notificar agendamento via WhatsApp
exports.notifyAppointment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { phoneNumber, nome, data: appointmentDate, horario } = data;

  if (!phoneNumber || !nome || !appointmentDate || !horario) {
    throw new functions.https.HttpsError('invalid-argument', 'Dados incompletos para envio da mensagem');
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = `Olá ${nome}! Seu agendamento foi confirmado para ${appointmentDate} às ${horario}. Agradecemos a preferência!`;
    
    await sendWhatsAppMessage(formattedPhone, message);
    
    return { success: true, message: 'Notificação enviada com sucesso' };
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao enviar notificação via WhatsApp');
  }
});

// Função de teste para envio de WhatsApp
exports.testWhatsApp = functions.https.onCall(async (data, context) => {
  try {
    const phoneNumber = "+5566999161540"; // Seu número formatado
    const message = "Teste de mensagem do sistema de agendamento. Se você recebeu esta mensagem, significa que o sistema está funcionando corretamente!";
    
    console.log('Iniciando teste de envio para:', phoneNumber);
    const result = await sendWhatsAppMessage(phoneNumber, message);
    console.log('Resultado do teste:', result);
    
    return { success: true, result };
  } catch (error) {
    console.error('Erro no teste:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Função temporária para criar agendamento de teste
exports.createTestAppointment = functions.https.onCall(async (data, context) => {
  try {
    const agendamentoData = {
      nome: "Teste WhatsApp",
      phoneNumber: "+5566999161540",
      data: new Date().toISOString().split('T')[0], // Data atual
      hora: "14:30",
      local: "Ótica Davi - Centro",
      servico: "Consulta Oftalmológica",
      status: "Agendado",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Criar o agendamento no Firestore
    const docRef = await admin.firestore().collection('agendamentos').add(agendamentoData);
    
    // Enviar mensagem WhatsApp
    const message = `Olá! Seu agendamento foi confirmado:\nData: ${agendamentoData.data}\nHora: ${agendamentoData.hora}\nLocal: ${agendamentoData.local}\nServiço: ${agendamentoData.servico}`;
    
    await sendWhatsAppMessage(agendamentoData.phoneNumber, message);
    
    console.log('Agendamento criado com sucesso:', docRef.id);
    return { success: true, appointmentId: docRef.id };
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

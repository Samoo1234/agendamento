const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar o app do Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Função para criar um agendamento de teste
async function createTestAppointment() {
  try {
    // Data e hora atual formatadas
    const now = new Date();
    const dataFormatada = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const horaFormatada = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Dados do agendamento de teste
    const agendamentoData = {
      nome: "João Silva (Teste)",
      telefone: "66999161540", // Número para teste
      data: dataFormatada,
      horario: horaFormatada,
      cidade: "Cuiabá",
      servico: "Consulta",
      status: "confirmado",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('Criando agendamento de teste:', agendamentoData);
    
    // Adicionar o agendamento ao Firestore
    const docRef = await db.collection('agendamentos').add(agendamentoData);
    
    console.log(`Agendamento criado com ID: ${docRef.id}`);
    console.log('A Cloud Function sendWhatsAppConfirmation deve ser acionada automaticamente.');
    console.log('Verifique os logs das Cloud Functions para confirmar o envio da mensagem.');
    
    // Aguardar 10 segundos e verificar se a notificação foi enviada
    console.log('Aguardando 10 segundos para verificar o status da notificação...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verificar o documento atualizado
    const docSnapshot = await docRef.get();
    const updatedData = docSnapshot.data();
    
    console.log('Status da notificação:', {
      enviada: updatedData.notificacaoEnviada,
      timestamp: updatedData.notificacaoTimestamp?.toDate(),
      id: updatedData.notificacaoId,
      erro: updatedData.notificacaoErro
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar agendamento de teste:', error);
    throw error;
  } finally {
    // Encerrar a conexão com o Firebase
    admin.app().delete();
  }
}

// Executar o teste
createTestAppointment()
  .then(id => {
    console.log(`Teste concluído. ID do agendamento: ${id}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Falha no teste:', error);
    process.exit(1);
  });

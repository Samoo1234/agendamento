// Importações necessárias
const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKRRrQMWRmvkQxZqbpVOgFE9iZwLN5B8I",
  authDomain: "oticadavi-113e0.firebaseapp.com",
  projectId: "oticadavi-113e0",
  storageBucket: "oticadavi-113e0.appspot.com",
  messagingSenderId: "1015764558753",
  appId: "1:1015764558753:web:d5f0d3f6c8d8f0d3f6c8d8"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Função para chamar a Cloud Function
async function callTestWhatsApp() {
  try {
    console.log('Chamando a função testWhatsApp...');
    
    // Obter a referência para a função Cloud
    const testWhatsApp = httpsCallable(functions, 'testWhatsApp');
    
    // Chamar a função
    const result = await testWhatsApp();
    
    console.log('Resultado:', result.data);
    console.log('Notificação enviada com sucesso via Cloud Function!');
  } catch (error) {
    console.error('Erro ao chamar a função:', error);
  }
}

// Função para chamar a função de notificação de agendamento
async function callNotifyAppointment() {
  try {
    console.log('Chamando a função notifyAppointment...');
    
    // Obter a referência para a função Cloud
    const notifyAppointment = httpsCallable(functions, 'notifyAppointment');
    
    // Chamar a função com os dados do agendamento
    const result = await notifyAppointment({
      phoneNumber: "+5566999161540",
      nome: "Cliente Teste",
      data: "25/02/2025",
      horario: "15:00"
    });
    
    console.log('Resultado:', result.data);
    console.log('Notificação de agendamento enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao chamar a função:', error);
  }
}

// Executar as funções
async function main() {
  try {
    // Primeiro testa a função testWhatsApp
    await callTestWhatsApp();
    
    // Depois testa a função notifyAppointment
    await callNotifyAppointment();
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

main();

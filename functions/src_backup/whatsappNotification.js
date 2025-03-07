const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');

// Não inicializar o app aqui, pois já é inicializado no index.js
// admin.initializeApp();

// Função para formatar a data de AAAA-MM-DD para DD/MM/AAAA
function formatarData(dataString) {
    // Verificar se a data já está no formato DD/MM/AAAA
    if (dataString.includes('/')) {
        return dataString; // Já está no formato correto
    }
    
    try {
        // Tentar converter a data no formato AAAA-MM-DD para DD/MM/AAAA
        const partes = dataString.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return dataString; // Retornar a string original se não conseguir converter
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dataString; // Retornar a string original em caso de erro
    }
}

// Configuração do WhatsApp Business API
const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
const phoneNumberId = "576714648854724";
const version = 'v21.0'; // versão atual da API

// Função para enviar mensagem de texto simples
async function enviarMensagemTexto(numero, texto) {
    // Se o número não começar com 55, adiciona
    if (!numero.startsWith('55')) {
        numero = '55' + numero;
    }
    
    // Remove espaços e caracteres especiais
    numero = numero.replace(/\D/g, '');

    const message = {
        messaging_product: "whatsapp",
        to: numero,
        type: "text",
        text: { body: texto }
    };

    return axios({
        method: "POST",
        url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
        data: message,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    });
}

// Função para enviar notificação WhatsApp
async function enviarNotificacaoWhatsApp(telefone, mensagem) {
  // ... resto do código de envio
}

// Corrigindo a sintaxe do trigger do Firestore
exports.onAgendamentoCreate = functions.firestore
  .document('agendamentos/{agendamentoId}')
  .onCreate(async (snap, context) => {
    const agendamento = snap.data();
    // ... resto do código
});

exports.onAgendamentoUpdate = functions.firestore
  .document('agendamentos/{agendamentoId}')
  .onUpdate(async (change, context) => {
    const novoAgendamento = change.after.data();
    // ... resto do código
});

const fetch = require('node-fetch');

// Configurações do WhatsApp
const config = {
  token: "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD",
  phone_id: "576714648854724"
};

// Função para enviar mensagem simples via WhatsApp
async function sendMessage(phoneNumber, message) {
  try {
    // Formata o número de telefone
    const formattedNumber = `+55${phoneNumber}`;
    console.log(`Enviando mensagem para: ${formattedNumber}`);
    
    const url = `https://graph.facebook.com/v17.0/${config.phone_id}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "text",
      text: { body: message }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.messages && data.messages.length > 0) {
      console.log('Mensagem enviada com sucesso! ID:', data.messages[0].id);
      return true;
    } else {
      console.error('Erro ao enviar mensagem:', data);
      return false;
    }
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
}

// Mensagem personalizada
const mensagem = `
🔔 *NOTIFICAÇÃO DE TESTE* 🔔

Olá! Esta é uma notificação de teste do sistema de agendamento da Ótica Davi.

📅 Data: 25/02/2025
⏰ Horário: 15:00
📍 Local: Ótica Davi - Centro

Esta mensagem confirma que o sistema de notificações via WhatsApp está funcionando corretamente.

Obrigado por utilizar nosso sistema!
`;

// Executar o envio
sendMessage("66999161540", mensagem)
  .then(success => {
    if (success) {
      console.log("Notificação personalizada enviada com sucesso!");
    } else {
      console.log("Falha ao enviar notificação personalizada.");
    }
  });

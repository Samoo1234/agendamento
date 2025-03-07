const fetch = require('node-fetch');

// Configurações do WhatsApp
const config = {
  token: "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD",
  phone_id: "576714648854724"
};

// Função para enviar mensagem simples via WhatsApp
async function sendMessage(phoneNumber) {
  try {
    // Formata o número de telefone
    const formattedNumber = `+55${phoneNumber}`;
    console.log(`Enviando mensagem para: ${formattedNumber}`);
    
    const message = `Olá! Esta é uma notificação de teste do sistema de agendamento. Enviada em: ${new Date().toLocaleString('pt-BR')}`;
    
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
    console.log('Resposta:', JSON.stringify(data, null, 2));
    
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

// Executar o envio
sendMessage("66999161540")
  .then(success => {
    if (success) {
      console.log("Notificação enviada com sucesso!");
    } else {
      console.log("Falha ao enviar notificação.");
    }
  });

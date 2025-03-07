const fetch = require('node-fetch');

async function sendMessage() {
  try {
    // Configurações
    const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = "576714648854724";
    
    // Número de telefone do usuário (conforme fornecido)
    const userNumber = "556699161540";
    
    // Número de telefone da conta (conforme verificado)
    const businessNumber = "556692582862";
    
    console.log(`Enviando mensagem para o número do usuário: ${userNumber}`);
    
    // Mensagem para o usuário
    const userMessage = `TESTE FINAL PARA USUÁRIO: Por favor, confirme se recebeu esta mensagem. Hora: ${new Date().toLocaleTimeString()}`;
    
    // Enviar para o número do usuário
    const userResponse = await sendWhatsAppMessage(phoneNumberId, token, userNumber, userMessage);
    console.log("Resposta (usuário):", JSON.stringify(userResponse, null, 2));
    
    return { userResponse };
  } catch (error) {
    console.error("Erro na execução:", error);
    return { error: error.message };
  }
}

async function sendWhatsAppMessage(phoneNumberId, token, to, message) {
  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: message }
  };
  
  console.log(`Enviando para ${to}:`, JSON.stringify(body, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  return await response.json();
}

// Executar o teste
sendMessage()
  .then(result => {
    console.log("Teste concluído.");
  })
  .catch(error => {
    console.error("Falha no teste:", error);
  });

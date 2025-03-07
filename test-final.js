const fetch = require('node-fetch');

async function sendMessage() {
  try {
    // Configurações
    const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = "576714648854724";
    const recipientNumber = "556699161540"; // Sem o + na frente
    
    console.log(`Enviando mensagem para: ${recipientNumber}`);
    
    // Mensagem
    const message = "TESTE FINAL: Por favor, confirme se recebeu esta mensagem. Hora: " + new Date().toLocaleTimeString();
    
    // Montar a requisição
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: recipientNumber,
      type: "text",
      text: { body: message }
    };
    
    console.log("Enviando requisição...");
    console.log("URL:", url);
    console.log("Corpo:", JSON.stringify(body, null, 2));
    
    // Enviar a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // Processar a resposta
    const responseData = await response.json();
    console.log("Resposta completa:", JSON.stringify(responseData, null, 2));
    
    if (responseData.error) {
      console.error("ERRO:", responseData.error);
    } else if (responseData.messages && responseData.messages.length > 0) {
      console.log("SUCESSO! ID da mensagem:", responseData.messages[0].id);
    }
    
    return responseData;
  } catch (error) {
    console.error("Erro na execução:", error);
    return { error: error.message };
  }
}

// Executar o teste
sendMessage()
  .then(result => {
    console.log("Teste concluído.");
  })
  .catch(error => {
    console.error("Falha no teste:", error);
  });

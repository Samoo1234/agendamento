const fetch = require('node-fetch');

async function sendMessage() {
  try {
    // Configurações
    const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = "576714648854724"; // ID do seu número de negócios
    
    // Número para o qual você quer enviar a mensagem (seu número pessoal)
    // Certifique-se de que este número esteja na lista de números permitidos durante o período de teste
    const targetNumber = "556699161540"; // Substitua pelo seu número pessoal
    
    console.log(`Enviando mensagem do número de negócios (+55 66 9258-2862) para: ${targetNumber}`);
    
    // Mensagem
    const message = `TESTE FINAL: Esta é uma mensagem de teste do sistema de agendamento da Ótica Davi. Enviada em: ${new Date().toLocaleString('pt-BR')}`;
    
    // Montar a requisição
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: targetNumber,
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
      return { success: false, error: responseData.error };
    } else if (responseData.messages && responseData.messages.length > 0) {
      console.log("SUCESSO! ID da mensagem:", responseData.messages[0].id);
      return { success: true, messageId: responseData.messages[0].id };
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
    if (result.success) {
      console.log("\n✅ Mensagem enviada com sucesso!");
      console.log("Se você não recebeu a mensagem, verifique se:");
      console.log("1. Seu número está na lista de números permitidos no WhatsApp Business");
      console.log("2. Você concluiu o processo de verificação do número");
      console.log("3. Sua conta não está em modo sandbox (que limita envios)");
    } else {
      console.log("\n❌ Falha ao enviar mensagem.");
      console.log("Verifique os detalhes do erro acima.");
    }
  })
  .catch(error => {
    console.error("Falha no teste:", error);
  });

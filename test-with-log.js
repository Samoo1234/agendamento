const fetch = require('node-fetch');
const fs = require('fs');

async function sendMessage() {
  try {
    // Configurações
    const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = "576714648854724";
    
    // Testar com diferentes formatos de número
    const phoneFormats = [
      "556699161540",  // Sem o +
      "+556699161540", // Com o +
      "6699161540",    // Sem o código do país
      "+5566999161540" // Com 9 extra
    ];
    
    const results = {};
    
    for (const phoneNumber of phoneFormats) {
      console.log(`\nTentando enviar para: ${phoneNumber}`);
      
      // Mensagem
      const message = `TESTE (formato ${phoneNumber}): Por favor, confirme se recebeu esta mensagem. Hora: ${new Date().toLocaleTimeString()}`;
      
      // Montar a requisição
      const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
      const body = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: message }
      };
      
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
      
      // Salvar o resultado
      results[phoneNumber] = {
        success: !responseData.error,
        data: responseData
      };
      
      if (responseData.error) {
        console.log(`ERRO para ${phoneNumber}:`, responseData.error.message);
      } else if (responseData.messages && responseData.messages.length > 0) {
        console.log(`SUCESSO para ${phoneNumber}! ID:`, responseData.messages[0].id);
      }
    }
    
    // Salvar todos os resultados em um arquivo
    fs.writeFileSync('whatsapp-test-results.json', JSON.stringify(results, null, 2));
    console.log('\nResultados salvos em whatsapp-test-results.json');
    
    return results;
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

const fetch = require('node-fetch');

// Configurações do WhatsApp
const config = {
  token: "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD",
  phone_id: "576714648854724"
};

// Função para enviar mensagem simples via WhatsApp
async function sendSimpleMessage(phoneNumber, message) {
  try {
    console.log(`Enviando mensagem para: ${phoneNumber}`);
    
    const url = `https://graph.facebook.com/v17.0/${config.phone_id}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message }
    };
    
    console.log('Corpo da requisição:', JSON.stringify(body, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro na resposta:', data);
      return { success: false, error: data };
    }
    
    console.log('Resposta:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return { success: false, error: error.message };
  }
}

// Função principal
async function main() {
  const phoneNumber = "+5566999161540"; // Substitua pelo seu número
  const message = "Teste simples de WhatsApp " + new Date().toISOString();
  
  console.log("Iniciando teste...");
  const result = await sendSimpleMessage(phoneNumber, message);
  
  if (result.success) {
    console.log("Mensagem enviada com sucesso!");
  } else {
    console.log("Falha ao enviar mensagem.");
  }
  
  console.log("Teste concluído.");
}

// Executar o teste
main();

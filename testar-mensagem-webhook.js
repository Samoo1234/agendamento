const axios = require('axios');

// Configurações
const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
const phoneNumberId = "576714648854724";
const recipientPhone = "5566999161540"; // Substitua pelo seu número de telefone para teste

async function enviarMensagemTeste() {
  try {
    console.log('Enviando mensagem de teste...');
    
    // Atualizar para a versão mais recente da API (v21.0)
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const data = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "text",
      text: { 
        body: "Esta é uma mensagem de teste para verificar se o webhook está funcionando. Por favor, responda com 'sim' ou 'não'." 
      }
    };
    
    console.log('URL:', url);
    console.log('Dados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(url, data, { headers });
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
    console.log('✅ Mensagem enviada com sucesso!');
    console.log('Agora, responda a mensagem no WhatsApp e verifique os logs do Firebase para ver se o webhook está processando a resposta.');
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem de teste:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.error(error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Executar
enviarMensagemTeste();

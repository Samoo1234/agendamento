/**
 * Script simples para testar o envio de mensagem via WhatsApp
 */
const axios = require('axios');

// Configurações
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';

// Função para enviar mensagem
async function enviarMensagem(telefone, texto) {
  try {
    console.log(`\nEnviando mensagem para ${telefone}`);
    console.log(`Texto: "${texto}"`);
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: { body: texto }
    };
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log('\nMensagem enviada com sucesso!');
    console.log('Resposta:', response.data);
    return true;
  } catch (error) {
    console.error('\nErro ao enviar mensagem:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Erro:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Executar teste
const telefone = '5566999161540';
const mensagem = 'Teste de mensagem do WhatsApp. Se você recebeu esta mensagem, significa que o sistema está funcionando!';

enviarMensagem(telefone, mensagem);

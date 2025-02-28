const axios = require('axios');
const fs = require('fs');

// Configurações
const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
const phoneNumberId = "576714648854724";
const recipientPhone = "5566999161540"; // Substitua pelo seu número de telefone para teste

async function enviarMensagemTemplate() {
  try {
    console.log('Enviando mensagem usando template...');
    
    // Usar a versão mais recente da API (v22.0)
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Usar o template "template_agendamento" que já está aprovado
    const data = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "template",
      template: { 
        name: "template_agendamento",
        language: { code: "pt_BR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "João Silva" },
              { type: "text", text: "28/02/2025" },
              { type: "text", text: "15:30" },
              { type: "text", text: "Rondonópolis" }
            ]
          }
        ]
      }
    };
    
    console.log('URL:', url);
    console.log('Dados:', JSON.stringify(data, null, 2));
    
    // Salvar a requisição em um arquivo para referência
    fs.writeFileSync('ultima-requisicao.json', JSON.stringify({
      url,
      headers,
      data
    }, null, 2));
    
    const response = await axios.post(url, data, { headers });
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
    // Salvar a resposta em um arquivo para referência
    fs.writeFileSync('ultima-resposta.json', JSON.stringify({
      status: response.status,
      data: response.data
    }, null, 2));
    
    console.log('✅ Mensagem enviada com sucesso!');
    console.log('Agora, responda a mensagem no WhatsApp e verifique os logs do Firebase para ver se o webhook está processando a resposta.');
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem de template:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
      
      // Salvar o erro em um arquivo para referência
      fs.writeFileSync('ultimo-erro.json', JSON.stringify({
        status: error.response.status,
        data: error.response.data
      }, null, 2));
    } else {
      console.error(error.message);
      
      // Salvar o erro em um arquivo para referência
      fs.writeFileSync('ultimo-erro.json', JSON.stringify({
        message: error.message,
        stack: error.stack
      }, null, 2));
    }
  }
}

// Executar
enviarMensagemTemplate();

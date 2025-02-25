const fetch = require('node-fetch');

async function sendWhatsAppMessage(toPhoneNumber, { nome, data, hora, cidade } = {}) {
  const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
  const phoneNumberId = "576714648854724";
  
  const cleanNumber = toPhoneNumber.replace(/[\s\-\(\)]/g, '');
  const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
  
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: "template_agendamento",
        language: {
          code: "pt_BR"
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: nome || "Cliente" },
              { type: "text", text: data || "00/00/0000" },
              { type: "text", text: hora || "00:00" },
              { type: "text", text: cidade || "Não especificada" }
            ]
          }
        ]
      }
    };

    console.log('Enviando mensagem para:', formattedNumber);
    console.log('Corpo da requisição:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Resposta completa:', data);
    
    if (!response.ok) {
      console.error('Erro na resposta:', data);
      throw new Error(`Erro: ${data.error?.message || 'Desconhecido'}`);
    }

    console.log('Mensagem enviada com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

async function main() {
  try {
    const testNumber = '6699161540';
    console.log('Iniciando teste de envio para:', testNumber);
    
    // Teste com dados de exemplo
    await sendWhatsAppMessage(testNumber, {
      nome: "João",
      data: "15/02/2024",
      hora: "14:30",
      cidade: "Cuiabá"
    });
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

main();

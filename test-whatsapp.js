const fetch = require('node-fetch');

async function sendWhatsAppMessage(toPhoneNumber) {
  const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
  const phoneNumberId = "576714648854724"; // ID do número do WhatsApp Business
  
  // Formatar o número do destinatário para o padrão internacional
  const cleanNumber = toPhoneNumber.replace(/[\s\-\(\)]/g, '');
  // Adicionar o código do país se não estiver presente
  const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
  
  console.log('Configurações:', {
    phoneNumberId,
    businessNumber: '556692582862', // Número que envia
    toNumber: formattedNumber, // Número que recebe
    apiVersion: 'v21.0'
  });
  
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
              {
                type: "text",
                text: "Samoel"
              }
            ]
          }
        ]
      }
    };
    
    console.log('URL da requisição:', url);
    console.log('Corpo da requisição:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro detalhado:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(`Erro na API do WhatsApp: ${JSON.stringify(data)}`);
    }

    console.log('Resposta da API:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

async function main() {
  try {
    // Número do cliente que vai receber a mensagem
    const clientNumber = "66999161540";
    
    console.log('Iniciando teste com template de agendamento...');
    console.log('Usando apenas um parâmetro para teste');
    
    const result = await sendWhatsAppMessage(clientNumber);
    console.log('Mensagem enviada com sucesso:', result);
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

main();

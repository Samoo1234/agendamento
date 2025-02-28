const fetch = require('node-fetch');
const fs = require('fs');

async function sendWhatsAppMessage(toPhoneNumber, { nome, data, hora, cidade } = {}) {
  const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
  const phoneNumberId = "576714648854724";
  const apiVersion = "v17.0"; // Atualizado para a versão mais recente
  
  // Garantir que o número de telefone tenha o formato correto
  let formattedNumber = toPhoneNumber;
  if (!formattedNumber.startsWith('55')) {
    formattedNumber = '55' + formattedNumber;
  }
  
  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
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
              { type: "text", text: data || "15/02/2024" },
              { type: "text", text: hora || "14:30" },
              { type: "text", text: cidade || "Sinop" }
            ]
          }
        ]
      }
    };

    console.log('Enviando mensagem para:', formattedNumber);
    console.log('Corpo da requisição:', JSON.stringify(body, null, 2));
    console.log('URL da API:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();
    console.log('Resposta completa:', responseData);
    fs.writeFileSync('response.json', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error('Erro na resposta:', responseData);
      throw new Error(`Erro: ${responseData.error?.message || 'Desconhecido'}`);
    }

    console.log('Mensagem enviada com sucesso:', responseData);
    return responseData;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    fs.writeFileSync('error.json', JSON.stringify({error: error.message, stack: error.stack}, null, 2));
    throw error;
  }
}

async function main() {
  try {
    const testNumber = '66999161540';
    console.log('Iniciando teste de envio para:', testNumber);
    
    // Teste com dados de exemplo para hoje
    const dataAtual = new Date();
    const dataFormatada = `${dataAtual.getDate().toString().padStart(2, '0')}/${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}/${dataAtual.getFullYear()}`;
    const horaFormatada = `${dataAtual.getHours().toString().padStart(2, '0')}:${dataAtual.getMinutes().toString().padStart(2, '0')}`;
    
    const result = await sendWhatsAppMessage(testNumber, {
      nome: "João Silva",
      data: dataFormatada,
      hora: horaFormatada,
      cidade: "Cuiabá"
    });
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Falha no teste:', error);
  }
}

main();

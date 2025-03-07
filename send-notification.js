const fetch = require('node-fetch');

// Configurações do WhatsApp
const config = {
  token: "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD",
  phone_id: "576714648854724"
};

// Função para formatar o número de telefone
function formatPhoneNumber(phone) {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Se já começar com 55, remove para não duplicar
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.substring(2);
  }
  
  // Adiciona o +55
  return `+55${cleaned}`;
}

// Função para enviar mensagem simples via WhatsApp
async function sendSimpleMessage(phoneNumber, message) {
  try {
    // Formata o número de telefone
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log(`Enviando mensagem para: ${formattedNumber}`);
    
    const url = `https://graph.facebook.com/v17.0/${config.phone_id}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: formattedNumber,
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

// Função para enviar mensagem de template via WhatsApp
async function sendTemplateMessage(phoneNumber, { nome, data, hora, cidade }) {
  try {
    // Formata o número de telefone
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log(`Enviando mensagem de template para: ${formattedNumber}`);
    
    const url = `https://graph.facebook.com/v17.0/${config.phone_id}/messages`;
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
              { type: "text", text: data || "25/02/2025" },
              { type: "text", text: hora || "15:00" },
              { type: "text", text: cidade || "Mantena" }
            ]
          }
        ]
      }
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
  const phoneNumber = "66999161540"; // Número fornecido pelo usuário
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
  const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  
  console.log("Enviando mensagem simples...");
  await sendSimpleMessage(
    phoneNumber, 
    `Olá! Esta é uma mensagem de teste do sistema de agendamento. Mensagem enviada em: ${formattedDate} às ${formattedTime}.`
  );
  
  console.log("\nEnviando mensagem com template...");
  await sendTemplateMessage(
    phoneNumber, 
    {
      nome: "Cliente",
      data: formattedDate,
      hora: formattedTime,
      cidade: "Mantena"
    }
  );
  
  console.log("\nNotificações enviadas com sucesso!");
}

// Executar o envio
main();

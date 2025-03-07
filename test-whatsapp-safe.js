const fetch = require('node-fetch');

// Função para obter as configurações
function getConfig() {
  // Configurações do Firebase Functions (obtidas do comando firebase functions:config:get)
  return {
    whatsapp: {
      token: "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD",
      phone_id: "576714648854724"
    }
  };
}

// Função para enviar mensagem via WhatsApp
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const config = getConfig();
    const whatsappToken = config.whatsapp.token;
    const phoneNumberId = config.whatsapp.phone_id;

    if (!whatsappToken || !phoneNumberId) {
      console.error('Configurações ausentes:', { whatsappToken: !!whatsappToken, phoneNumberId: !!phoneNumberId });
      throw new Error('Configurações do WhatsApp não encontradas');
    }

    // Log do número de telefone antes do envio
    console.log('Tentando enviar mensagem para:', phoneNumber);
    
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    console.log('URL da requisição:', url);
    
    const body = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message }
    };
    
    console.log('Corpo da requisição:', JSON.stringify(body));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(`Erro na API do WhatsApp: ${data.error?.message || 'Erro desconhecido'}`);
    }

    console.log('Resposta completa da API:', data);
    return data;
  } catch (error) {
    console.error('Erro detalhado ao enviar mensagem:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Função para enviar mensagem via WhatsApp usando template
async function sendWhatsAppTemplateMessage(phoneNumber, { nome, data, hora, cidade }) {
  try {
    const config = getConfig();
    const whatsappToken = config.whatsapp.token;
    const phoneNumberId = config.whatsapp.phone_id;

    if (!whatsappToken || !phoneNumberId) {
      console.error('Configurações ausentes:', { whatsappToken: !!whatsappToken, phoneNumberId: !!phoneNumberId });
      throw new Error('Configurações do WhatsApp não encontradas');
    }

    // Log do número de telefone antes do envio
    console.log('Tentando enviar mensagem para:', phoneNumber);
    
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    console.log('URL da requisição:', url);
    
    const body = {
      messaging_product: "whatsapp",
      to: phoneNumber,
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
              { type: "text", text: nome },
              { type: "text", text: data },
              { type: "text", text: hora },
              { type: "text", text: cidade }
            ]
          }
        ]
      }
    };
    
    console.log('Corpo da requisição:', JSON.stringify(body));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(`Erro na API do WhatsApp: ${responseData.error?.message || 'Erro desconhecido'}`);
    }

    console.log('Resposta completa da API:', responseData);
    return responseData;
  } catch (error) {
    console.error('Erro detalhado ao enviar mensagem:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

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

// Função principal para testar
async function main() {
  try {
    // Substitua pelo seu número de telefone para teste
    const phoneNumber = "+5566999161540"; // Seu número formatado
    
    // Teste de mensagem simples
    console.log('\n--- Teste de mensagem simples ---');
    const message = "Teste de mensagem do sistema de agendamento. Se você recebeu esta mensagem, significa que o sistema está funcionando corretamente!";
    await sendWhatsAppMessage(phoneNumber, message);
    
    // Teste de mensagem com template
    console.log('\n--- Teste de mensagem com template ---');
    await sendWhatsAppTemplateMessage(phoneNumber, {
      nome: "Cliente Teste",
      data: "25/02/2025",
      hora: "14:30",
      cidade: "Mantena"
    });
    
    console.log('\nTestes concluídos com sucesso!');
  } catch (error) {
    console.error('Erro nos testes:', error);
  }
}

// Executar os testes
main();

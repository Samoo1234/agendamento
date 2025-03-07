const fetch = require('node-fetch');

// Configurações do WhatsApp
const config = {
  token: "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD",
  phone_id: "576714648854724"
};

// Função para verificar o status do token
async function checkTokenStatus() {
  try {
    console.log('Verificando status do token...');
    
    const url = `https://graph.facebook.com/v17.0/me`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Token válido:', data);
      return true;
    } else {
      console.error('Token inválido:', data);
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}

// Função para verificar os templates disponíveis
async function checkTemplates() {
  try {
    console.log('Verificando templates disponíveis...');
    
    const url = `https://graph.facebook.com/v17.0/${config.phone_id}/message_templates`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Templates disponíveis:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.error('Erro ao verificar templates:', data);
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar templates:', error);
    return false;
  }
}

// Função para enviar mensagem com diferentes formatos de número
async function testPhoneFormats(baseNumber) {
  const formats = [
    `+55${baseNumber}`,
    `55${baseNumber}`,
    `+${baseNumber}`,
    baseNumber
  ];
  
  console.log('Testando diferentes formatos de número...');
  
  for (const phoneNumber of formats) {
    try {
      console.log(`\nTentando formato: ${phoneNumber}`);
      
      const url = `https://graph.facebook.com/v17.0/${config.phone_id}/messages`;
      const body = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: `Teste de formato: ${phoneNumber} - ${new Date().toISOString()}` }
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
      
      console.log(`Resposta para ${phoneNumber}:`, JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.error(`Erro para ${phoneNumber}:`, data.error);
      } else if (data.messages && data.messages.length > 0) {
        console.log(`Sucesso para ${phoneNumber}! ID:`, data.messages[0].id);
      }
    } catch (error) {
      console.error(`Erro para ${phoneNumber}:`, error);
    }
  }
}

// Função para testar mensagem simples sem template
async function sendSimpleMessage(phoneNumber) {
  try {
    console.log('\nEnviando mensagem simples sem template...');
    
    const url = `https://graph.facebook.com/v17.0/${config.phone_id}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { 
        body: `TESTE URGENTE: Por favor, confirme se recebeu esta mensagem. Enviada em: ${new Date().toLocaleString('pt-BR')}`
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
    
    console.log('Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('Erro ao enviar mensagem simples:', data.error);
      return false;
    } else if (data.messages && data.messages.length > 0) {
      console.log('Mensagem simples enviada com sucesso! ID:', data.messages[0].id);
      return true;
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem simples:', error);
    return false;
  }
}

// Função principal
async function main() {
  // Verificar o status do token
  const tokenValid = await checkTokenStatus();
  if (!tokenValid) {
    console.log('O token parece estar inválido. Por favor, gere um novo token.');
    return;
  }
  
  // Verificar templates disponíveis
  await checkTemplates();
  
  // Testar diferentes formatos de número
  const baseNumber = "66999161540"; // Número fornecido pelo usuário
  await testPhoneFormats(baseNumber);
  
  // Enviar mensagem simples sem template
  await sendSimpleMessage(`+55${baseNumber}`);
  
  console.log('\nDEBUG COMPLETO. Por favor, verifique se recebeu alguma das mensagens de teste.');
}

// Executar o debug
main();

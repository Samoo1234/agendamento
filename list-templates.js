const fetch = require('node-fetch');
const fs = require('fs');

async function listTemplates() {
  const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
  const phoneNumberId = "576714648854724";
  
  try {
    // Tentar obter informações do número
    console.log('Obtendo informações do número...');
    const phoneUrl = `https://graph.facebook.com/v13.0/${phoneNumberId}`;
    const phoneResponse = await fetch(phoneUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const phoneData = await phoneResponse.json();
    console.log('Informações do número:', JSON.stringify(phoneData, null, 2));
    
    // Tentar obter a lista de templates
    console.log('Tentando obter lista de templates...');
    
    // Tentar com o business account ID
    if (phoneData.whatsapp_business_api_data && phoneData.whatsapp_business_api_data.business_account_id) {
      const businessId = phoneData.whatsapp_business_api_data.business_account_id;
      console.log(`Tentando com business account ID: ${businessId}`);
      
      const templatesUrl = `https://graph.facebook.com/v13.0/${businessId}/message_templates`;
      const templatesResponse = await fetch(templatesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const templatesData = await templatesResponse.json();
      console.log('Resposta da API:', JSON.stringify(templatesData, null, 2));
      fs.writeFileSync('templates-list.json', JSON.stringify(templatesData, null, 2));
    } else {
      console.log('Business account ID não encontrado, tentando com o ID do número...');
      
      // Tentar com o ID do número
      const templatesUrl = `https://graph.facebook.com/v13.0/${phoneNumberId}/message_templates`;
      const templatesResponse = await fetch(templatesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const templatesData = await templatesResponse.json();
      console.log('Resposta da API:', JSON.stringify(templatesData, null, 2));
      fs.writeFileSync('templates-list.json', JSON.stringify(templatesData, null, 2));
    }
    
    console.log('Verificação concluída!');
  } catch (error) {
    console.error('Erro na verificação:', error);
    fs.writeFileSync('templates-error.json', JSON.stringify({error: error.message, stack: error.stack}, null, 2));
  }
}

listTemplates();

const fetch = require('node-fetch');
const fs = require('fs');

async function checkTemplates() {
  const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
  const phoneNumberId = "101851139781728";
  
  try {
    // Verificar informações da conta WhatsApp Business
    console.log('Verificando informações da conta WhatsApp Business...');
    const accountUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}`;
    const accountResponse = await fetch(accountUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const accountData = await accountResponse.json();
    console.log('Informações da conta:', JSON.stringify(accountData, null, 2));
    fs.writeFileSync('account-info.json', JSON.stringify(accountData, null, 2));
    
    // Tentar obter templates de outra forma
    console.log('Verificando templates disponíveis...');
    const businessUrl = `https://graph.facebook.com/v21.0/101851139781728/message_templates?limit=20`;
    const businessResponse = await fetch(businessUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const businessData = await businessResponse.json();
    console.log('Templates disponíveis:', JSON.stringify(businessData, null, 2));
    fs.writeFileSync('templates-info.json', JSON.stringify(businessData, null, 2));
    
    console.log('Verificação concluída com sucesso!');
  } catch (error) {
    console.error('Erro na verificação:', error);
    fs.writeFileSync('check-error.json', JSON.stringify({error: error.message, stack: error.stack}, null, 2));
  }
}

checkTemplates();

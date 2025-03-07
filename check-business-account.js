const fetch = require('node-fetch');
const fs = require('fs');

async function checkBusinessAccount() {
  try {
    // Configurações
    const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = "576714648854724";
    
    console.log("Verificando informações da conta de negócios...");
    
    // 1. Verificar informações do número de telefone
    console.log("\n1. Verificando informações do número de telefone...");
    const phoneUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}`;
    const phoneResponse = await fetch(phoneUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const phoneData = await phoneResponse.json();
    console.log("Informações do número:", JSON.stringify(phoneData, null, 2));
    
    // 2. Verificar templates disponíveis
    console.log("\n2. Verificando templates disponíveis...");
    const templatesUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/message_templates`;
    const templatesResponse = await fetch(templatesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const templatesData = await templatesResponse.json();
    console.log("Templates disponíveis:", JSON.stringify(templatesData, null, 2));
    
    // 3. Verificar status da conta
    console.log("\n3. Verificando status da conta...");
    const accountUrl = `https://graph.facebook.com/v17.0/me/accounts`;
    const accountResponse = await fetch(accountUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const accountData = await accountResponse.json();
    console.log("Status da conta:", JSON.stringify(accountData, null, 2));
    
    // Salvar todos os resultados em um arquivo
    const results = {
      phone: phoneData,
      templates: templatesData,
      account: accountData
    };
    
    fs.writeFileSync('whatsapp-business-info.json', JSON.stringify(results, null, 2));
    console.log('\nInformações salvas em whatsapp-business-info.json');
    
    return results;
  } catch (error) {
    console.error("Erro na execução:", error);
    return { error: error.message };
  }
}

// Executar a verificação
checkBusinessAccount()
  .then(result => {
    console.log("Verificação concluída.");
  })
  .catch(error => {
    console.error("Falha na verificação:", error);
  });

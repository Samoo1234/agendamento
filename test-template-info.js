const fetch = require('node-fetch');
const fs = require('fs');

async function getTemplateInfo() {
  const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
  const phoneNumberId = "576714648854724";
  const businessId = "1000000000000000"; // Substitua pelo seu Business ID se souber
  
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
    fs.writeFileSync('phone-info.json', JSON.stringify(phoneData, null, 2));
    
    // Tentar obter informações do template usando o ID do WABA
    if (phoneData.waba_id) {
      console.log('Obtendo informações dos templates usando WABA ID...');
      const templatesUrl = `https://graph.facebook.com/v13.0/${phoneData.waba_id}/message_templates`;
      const templatesResponse = await fetch(templatesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const templatesData = await templatesResponse.json();
      console.log('Informações dos templates:', JSON.stringify(templatesData, null, 2));
      fs.writeFileSync('templates-info.json', JSON.stringify(templatesData, null, 2));
      
      // Procurar pelo template específico
      if (templatesData.data) {
        const targetTemplate = templatesData.data.find(t => t.name === 'template_agendamento');
        if (targetTemplate) {
          console.log('Template encontrado:', JSON.stringify(targetTemplate, null, 2));
          fs.writeFileSync('target-template.json', JSON.stringify(targetTemplate, null, 2));
        } else {
          console.log('Template "template_agendamento" não encontrado');
        }
      }
    }
    
    console.log('Verificação concluída!');
  } catch (error) {
    console.error('Erro na verificação:', error);
    fs.writeFileSync('template-error.json', JSON.stringify({error: error.message, stack: error.stack}, null, 2));
  }
}

getTemplateInfo();

const fetch = require('node-fetch');

async function checkWhatsAppStatus() {
    const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = "576714648854724";

    try {
        // Verificar informações da conta
        console.log('Verificando status da conta WhatsApp Business...');
        
        // Verificar o status do número
        const phoneResponse = await fetch(
            `https://graph.facebook.com/v21.0/${phoneNumberId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        const phoneData = await phoneResponse.json();
        console.log('\nInformações do número:', JSON.stringify(phoneData, null, 2));

        // Verificar os templates disponíveis
        const templatesResponse = await fetch(
            `https://graph.facebook.com/v21.0/${phoneNumberId}/message_templates`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        const templatesData = await templatesResponse.json();
        console.log('\nTemplates disponíveis:', JSON.stringify(templatesData, null, 2));

        // Verificar qualidade da conta
        const qualityResponse = await fetch(
            `https://graph.facebook.com/v21.0/${phoneNumberId}/phone_quality`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        const qualityData = await qualityResponse.json();
        console.log('\nQualidade da conta:', JSON.stringify(qualityData, null, 2));

    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
}

checkWhatsAppStatus();

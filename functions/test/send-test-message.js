const fetch = require('node-fetch');

// Configurações
const PHONE_NUMBER = "556699161540"; // Removido um 9 extra
const PHONE_ID = "576714648854724";
const TEST_MESSAGE = "Olá! Este é um teste do sistema de memória. Por favor, responda a esta mensagem para testarmos a funcionalidade.";
const WHATSAPP_TOKEN = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";

async function sendTestMessage() {
    try {
        console.log(' Enviando mensagem de teste...\n');
        console.log('Número de telefone:', PHONE_NUMBER);

        // Enviar mensagem
        const url = `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`;
        const body = {
            messaging_product: "whatsapp",
            to: PHONE_NUMBER,
            type: "text",
            text: { body: TEST_MESSAGE }
        };

        console.log('Requisição:', {
            url,
            body: JSON.stringify(body, null, 2)
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Erro na API do WhatsApp: ${JSON.stringify(data)}`);
        }

        console.log(' Mensagem enviada com sucesso!');
        console.log('Resposta:', JSON.stringify(data, null, 2));
        console.log('\nPróximos passos:');
        console.log('1. Verifique seu WhatsApp');
        console.log('2. Responda à mensagem');
        console.log('3. O sistema de memória irá processar sua resposta');

    } catch (error) {
        console.error(' Erro ao enviar mensagem:', error);
        if (error.response) {
            console.error('Detalhes do erro:', await error.response.json());
        }
    }
}

// Enviar mensagem
sendTestMessage();

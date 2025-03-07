const functions = require('firebase-functions');
const geminiService = require('./geminiService');
const deploymentControl = require('./deploymentControl');
const axios = require('axios');

// Configurações do WhatsApp
const VERIFY_TOKEN = "8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821";
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';

// Função para enviar mensagem
async function enviarMensagem(telefone, texto) {
    try {
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
            data: {
                messaging_product: "whatsapp",
                to: telefone,
                type: "text",
                text: { body: texto }
            },
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            }
        });
        console.log('Mensagem enviada com sucesso para:', telefone);
        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        return false;
    }
}

exports.whatsAppWebhookWithMemory = functions.https.onRequest(async (req, res) => {
    console.log('Webhook com memória recebeu requisição:', req.method);

    if (req.method === 'GET') {
        // Verificação do webhook
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verificado com sucesso');
            res.status(200).send(challenge);
        } else {
            console.error('Falha na verificação do webhook');
            res.sendStatus(403);
        }
        return;
    }

    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (body.object === 'whatsapp_business_account') {
                for (const entry of body.entry || []) {
                    for (const change of entry.changes || []) {
                        if (change.value && change.value.messages) {
                            for (const message of change.value.messages) {
                                if (message.type === 'text') {
                                    const from = message.from;
                                    const text = message.text.body;

                                    console.log('Mensagem recebida de:', from);
                                    console.log('Conteúdo:', text);

                                    // Verifica se deve usar memória para este número
                                    const useMemory = await deploymentControl.shouldEnableMemory(from);
                                    console.log(`Sistema de memória ${useMemory ? 'ativado' : 'desativado'} para ${from}`);

                                    // Processa a mensagem usando o Gemini
                                    const response = await geminiService.processMessage(from, text, useMemory);
                                    console.log('Resposta gerada:', response);

                                    // Envia a resposta
                                    await enviarMensagem(from, response);
                                }
                            }
                        }
                    }
                }
            }

            res.sendStatus(200);
        } catch (error) {
            console.error('Erro no webhook:', error);
            res.sendStatus(500);
        }
    }
});

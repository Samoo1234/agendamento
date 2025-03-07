const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Configurações do WhatsApp
const VERIFY_TOKEN = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
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
        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        return false;
    }
}

// Função para buscar agendamentos
async function buscarAgendamentos(telefone) {
    try {
        const snapshot = await admin.firestore()
            .collection('agendamentos')
            .where('telefone', '==', telefone)
            .where('status', '==', 'pendente')
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
    }
}

// Função para formatar resposta
function formatarResposta(agendamentos) {
    if (agendamentos.length === 0) {
        return 'Não encontrei nenhum agendamento pendente para o seu número.';
    }

    const listaFormatada = agendamentos
        .map(a => `📅 ${a.data} às ${a.horario}`)
        .join('\n');

    return `Encontrei ${agendamentos.length} agendamento(s) pendente(s):\n\n${listaFormatada}`;
}

// Webhook principal
exports.whatsAppWebhookSimples = functions.https.onRequest(async (req, res) => {
    console.log('Webhook simples recebeu requisição:', req.method);

    // Verificação do webhook
    if (req.method === 'GET') {
        if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
            console.log('Webhook verificado com sucesso');
            res.send(req.query['hub.challenge']);
        } else {
            console.error('Falha na verificação do webhook');
            res.sendStatus(403);
        }
        return;
    }

    // Processamento de mensagens
    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (body.object === 'whatsapp_business_account') {
                for (const entry of body.entry || []) {
                    for (const change of entry.changes || []) {
                        if (change.value && change.value.messages) {
                            for (const message of change.value.messages) {
                                if (message.type === 'text') {
                                    const telefone = message.from;
                                    console.log('Recebida mensagem de:', telefone);

                                    // Busca agendamentos
                                    const agendamentos = await buscarAgendamentos(telefone);
                                    console.log('Agendamentos encontrados:', agendamentos);

                                    // Envia resposta
                                    const resposta = formatarResposta(agendamentos);
                                    await enviarMensagem(telefone, resposta);
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

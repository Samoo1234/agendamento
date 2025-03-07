const functions = require('firebase-functions');
const axios = require('axios');
const agent = require('./firebaseAgent');

// Configurações
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

// Função para gerar resposta
async function gerarResposta(mensagem, telefone) {
    mensagem = mensagem.toLowerCase();
    
    // Verificar se é consulta de agendamento
    if (mensagem.includes('agendamento') || mensagem.includes('consulta') || 
        mensagem.includes('horário') || mensagem.includes('verificar')) {
        try {
            // Buscar usando o número do cliente que está perguntando
            const agendamentos = await agent.buscarAgendamentos({
                status: 'pendente',
                telefone: telefone // Usar o número do cliente que ENVIOU a mensagem
            });
            
            if (agendamentos.length > 0) {
                const listaFormatada = agendamentos.map(a => 
                    `- ${new Date(a.data).toLocaleDateString('pt-BR')} às ${a.horario}`
                ).join('\n');
                
                return `Encontrei ${agendamentos.length} agendamento(s):\n${listaFormatada}`;
            }
            
            return `Não encontrei agendamentos pendentes para o seu número. Se você acabou de fazer um agendamento, aguarde alguns instantes e tente novamente.`;
            
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            return 'Desculpe, estou com dificuldade para acessar os agendamentos.';
        }
    }
    
    return 'Como posso ajudar?';
}

// Webhook principal
exports.whatsAppWebhook = functions.https.onRequest(async (req, res) => {
    // Verificação do webhook
    if (req.method === 'GET') {
        if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
            res.send(req.query['hub.challenge']);
        } else {
            res.sendStatus(403);
        }
        return;
    }

    // Processamento de mensagens
    if (req.method === 'POST') {
        try {
            const mensagem = req.body.entry[0].changes[0].value.messages[0];
            if (mensagem.type === 'text') {
                const resposta = await gerarResposta(mensagem.text.body, mensagem.from);
                await enviarMensagem(mensagem.from, resposta);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
        res.send('OK');
    }
});

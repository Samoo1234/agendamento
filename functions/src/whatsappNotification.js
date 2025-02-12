const functions = require('firebase-functions');
const axios = require('axios');

// Função para enviar mensagem via WhatsApp
exports.sendWhatsAppConfirmation = functions.firestore
    .document('agendamentos/{agendamentoId}')
    .onCreate(async (snap, context) => {
        const agendamento = snap.data();
        
        // Configuração do WhatsApp Business API
        const token = process.env.WHATSAPP_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const version = 'v17.0'; // versão atual da API
        
        try {
            // Formatar a mensagem
            const message = {
                messaging_product: "whatsapp",
                to: agendamento.telefone,
                type: "template",
                template: {
                    name: "confirmacao_consulta",
                    language: {
                        code: "pt_BR"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: agendamento.nome
                                },
                                {
                                    type: "text",
                                    text: agendamento.data
                                },
                                {
                                    type: "text",
                                    text: agendamento.horario
                                }
                            ]
                        }
                    ]
                }
            };

            // Enviar a mensagem
            const response = await axios({
                method: "POST",
                url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
                data: message,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            console.log('Mensagem enviada com sucesso:', response.data);
            return null;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            throw new functions.https.HttpsError('internal', 'Erro ao enviar mensagem no WhatsApp');
        }
    });

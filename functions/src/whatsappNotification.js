const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');

// Não inicializar o app aqui, pois já é inicializado no index.js
// admin.initializeApp();

// Função para enviar mensagem via WhatsApp
exports.sendWhatsAppConfirmation = functions.firestore
    .document('agendamentos/{agendamentoId}')
    .onCreate(async (snap, context) => {
        const agendamento = snap.data();
        
        // Configuração do WhatsApp Business API
        // Usando o token diretamente para fins de teste
        const token = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
        const phoneNumberId = "576714648854724";
        const version = 'v17.0'; // versão atual da API
        
        // Garantir que o número de telefone tenha o formato correto
        let formattedNumber = agendamento.telefone;
        if (!formattedNumber.startsWith('55')) {
            formattedNumber = '55' + formattedNumber;
        }
        
        try {
            console.log('Iniciando envio de notificação WhatsApp para:', formattedNumber);
            
            // Formatar a mensagem
            const message = {
                messaging_product: "whatsapp",
                to: formattedNumber,
                type: "template",
                template: {
                    name: "template_agendamento",
                    language: {
                        code: "pt_BR"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: agendamento.nome || "Cliente"
                                },
                                {
                                    type: "text",
                                    text: agendamento.data || "Data não especificada"
                                },
                                {
                                    type: "text",
                                    text: agendamento.horario || "Horário não especificado"
                                },
                                {
                                    type: "text",
                                    text: agendamento.cidade || "Não especificada"
                                }
                            ]
                        }
                    ]
                }
            };

            console.log('Corpo da requisição:', JSON.stringify(message));
            console.log('URL da API:', `https://graph.facebook.com/${version}/${phoneNumberId}/messages`);

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
            
            // Atualizar o documento com a confirmação de envio
            await snap.ref.update({
                notificacaoEnviada: true,
                notificacaoTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                notificacaoId: response.data.messages?.[0]?.id || null
            });
            
            return null;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
            
            // Registrar o erro no documento
            await snap.ref.update({
                notificacaoEnviada: false,
                notificacaoErro: error.response?.data?.error?.message || error.message,
                notificacaoTimestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            
            throw new functions.https.HttpsError('internal', 'Erro ao enviar mensagem no WhatsApp', error.message);
        }
    });

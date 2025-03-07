// Simulação de mensagens do WhatsApp
module.exports = {
    // Simula uma requisição GET de verificação do webhook
    getVerification: {
        method: 'GET',
        query: {
            'hub.mode': 'subscribe',
            'hub.verify_token': '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821',
            'hub.challenge': '123456'
        }
    },

    // Simula uma mensagem recebida do WhatsApp
    incomingMessage: {
        method: 'POST',
        body: {
            object: 'whatsapp_business_account',
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: '66999161540',
                            type: 'text',
                            text: {
                                body: 'Olá, gostaria de agendar uma consulta'
                            }
                        }]
                    }
                }]
            }]
        }
    },

    // Simula uma conversa completa
    conversationFlow: [
        {
            from: '66999161540',
            message: 'Olá, gostaria de agendar uma consulta'
        },
        {
            from: '66999161540',
            message: 'Para amanhã às 14h'
        },
        {
            from: '66999161540',
            message: 'Sim, pode ser esse horário'
        }
    ]
};

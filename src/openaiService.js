const axios = require('axios');

// Chave da API da OpenAI
const OPENAI_API_KEY = 'sua-chave-da-openai-aqui';

// Função para obter a chave da API
exports.getApiKey = async () => {
    return OPENAI_API_KEY;
};

// Função principal para processar mensagens com a IA
exports.processarMensagemIA = async (mensagem, telefone) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo.'
                    },
                    {
                        role: 'user',
                        content: mensagem
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao processar mensagem com OpenAI:', error);
        throw error;
    }
};
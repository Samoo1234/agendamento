const dotenv = require('dotenv');
const path = require('path');

// Carrega variáveis de ambiente
dotenv.config();

const config = {
    // Configurações do WhatsApp
    whatsapp: {
        token: process.env.WHATSAPP_TOKEN,
        phoneNumberId: process.env.PHONE_NUMBER_ID,
        verifyToken: process.env.VERIFY_TOKEN,
        webhookUrl: process.env.WEBHOOK_URL,
    },
    
    // Configurações da OpenAI
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.MAX_TOKENS) || 150,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        systemPrompt: process.env.OPENAI_SYSTEM_PROMPT || 'Você é um assistente de atendimento da Ótica Davi. Forneça respostas curtas e objetivas.',
    },
    
    // Configurações do Firebase
    firebase: {
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    },
    
    // Configurações de teste
    test: {
        defaultPhoneNumber: process.env.TEST_PHONE_NUMBER,
        testMessage: "Olá, isso é uma mensagem de teste!",
        timeout: parseInt(process.env.TEST_TIMEOUT) || 5000,
        iterations: parseInt(process.env.TEST_ITERATIONS) || 5,
    },
    
    // Configurações de logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'tests.log',
        directory: path.join(__dirname, 'results'),
    }
};

module.exports = config; 
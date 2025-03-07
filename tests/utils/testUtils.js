const fs = require('fs');
const path = require('path');
const config = require('../config');

// Função para logging consistente
const logger = {
    info: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO] ${timestamp} - ${message}`;
        console.log(logMessage);
        fs.appendFileSync(config.logging.file, logMessage + '\n');
    },
    error: (message, error) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[ERROR] ${timestamp} - ${message}\n${error?.stack || error}`;
        console.error(logMessage);
        fs.appendFileSync(config.logging.file, logMessage + '\n');
    }
};

// Função para salvar resultados de teste
const saveTestResults = (filename, results) => {
    const resultsPath = path.join(__dirname, '..', 'results', filename);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    logger.info(`Resultados salvos em ${resultsPath}`);
};

// Função para validar resposta da API
const validateApiResponse = (response) => {
    if (!response || !response.data) {
        throw new Error('Resposta inválida da API');
    }
    return response.data;
};

// Função para gerar mensagem de teste
const generateTestMessage = (customMessage) => {
    return {
        message: customMessage || config.test.testMessage,
        timestamp: new Date().toISOString(),
        phoneNumber: config.test.defaultPhoneNumber
    };
};

// Função para limpar arquivos de teste
const cleanupTestFiles = (pattern) => {
    const directory = path.join(__dirname, '..', 'results');
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        if (pattern.test(file)) {
            fs.unlinkSync(path.join(directory, file));
            logger.info(`Arquivo de teste removido: ${file}`);
        }
    });
};

module.exports = {
    logger,
    saveTestResults,
    validateApiResponse,
    generateTestMessage,
    cleanupTestFiles
}; 
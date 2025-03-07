const axios = require('axios');
const config = require('../config');
const { logger, saveTestResults, validateApiResponse } = require('../utils/testUtils');

class OpenAITester {
    constructor() {
        this.config = config.openai;
        this.axios = axios.create({
            headers: { 
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // Teste básico de conexão
    async testConnection() {
        try {
            const response = await this.axios.get('https://api.openai.com/v1/models');
            logger.info('Conexão com OpenAI estabelecida com sucesso');
            return validateApiResponse(response);
        } catch (error) {
            logger.error('Erro ao conectar com OpenAI', error);
            throw error;
        }
    }

    // Teste de processamento de mensagem com contexto do sistema
    async testMessageProcessing(message, systemPrompt = null) {
        try {
            const response = await this.axios.post('https://api.openai.com/v1/chat/completions', {
                model: this.config.model,
                messages: [
                    { 
                        role: 'system', 
                        content: systemPrompt || this.config.systemPrompt 
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            });
            
            const result = validateApiResponse(response);
            logger.info('Mensagem processada com sucesso');
            return result;
        } catch (error) {
            logger.error('Erro ao processar mensagem', error);
            throw error;
        }
    }

    // Teste de diferentes modelos
    async testModels(message, models = ['gpt-3.5-turbo', 'gpt-4']) {
        const results = {};
        
        for (const model of models) {
            try {
                const response = await this.axios.post('https://api.openai.com/v1/chat/completions', {
                    model,
                    messages: [
                        { 
                            role: 'system', 
                            content: this.config.systemPrompt 
                        },
                        { role: 'user', content: message }
                    ],
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature
                });
                
                results[model] = {
                    success: true,
                    response: validateApiResponse(response)
                };
                logger.info(`Teste com modelo ${model} concluído com sucesso`);
            } catch (error) {
                results[model] = {
                    success: false,
                    error: error.message
                };
                logger.error(`Erro ao testar modelo ${model}`, error);
            }
        }
        
        saveTestResults('models-test-results.json', results);
        return results;
    }

    // Teste de estabilidade
    async testStability(message, iterations = null) {
        const testIterations = iterations || config.test.iterations;
        const results = {
            successful: 0,
            failed: 0,
            averageResponseTime: 0,
            errors: [],
            responses: []
        };
        
        for (let i = 0; i < testIterations; i++) {
            const startTime = Date.now();
            try {
                const response = await this.testMessageProcessing(message);
                results.successful++;
                const responseTime = Date.now() - startTime;
                results.averageResponseTime += responseTime;
                results.responses.push({
                    iteration: i + 1,
                    responseTime,
                    content: response.choices[0].message.content
                });
            } catch (error) {
                results.failed++;
                results.errors.push({
                    iteration: i + 1,
                    error: error.message
                });
            }
        }
        
        results.averageResponseTime = results.averageResponseTime / testIterations;
        saveTestResults('stability-test-results.json', results);
        
        return results;
    }

    // Teste de atendimento específico da Ótica
    async testOpticalService(message) {
        try {
            const response = await this.testMessageProcessing(message);
            const result = {
                message,
                response: response.choices[0].message.content,
                timestamp: new Date().toISOString()
            };
            
            saveTestResults('optical-service-test.json', result);
            logger.info('Teste de atendimento da ótica concluído com sucesso');
            
            return result;
        } catch (error) {
            logger.error('Erro no teste de atendimento da ótica', error);
            throw error;
        }
    }
}

// Função principal para executar todos os testes
async function runAllTests() {
    const tester = new OpenAITester();
    const testMessage = "Qual o horário de funcionamento da ótica?";
    
    try {
        logger.info('\n=== INICIANDO TESTES DA OPENAI ===');
        logger.info(`Data e hora: ${new Date().toLocaleString()}`);
        
        // Teste de conexão
        await tester.testConnection();
        
        // Teste de processamento de mensagem
        const messageResult = await tester.testMessageProcessing(testMessage);
        logger.info('Teste de processamento concluído');
        
        // Teste de modelos
        const modelsResult = await tester.testModels(testMessage);
        logger.info('Teste de modelos concluído');
        
        // Teste de estabilidade
        const stabilityResult = await tester.testStability(testMessage);
        logger.info('Teste de estabilidade concluído');
        
        // Teste específico da ótica
        const opticalResult = await tester.testOpticalService(testMessage);
        logger.info('Teste de atendimento da ótica concluído');
        
        logger.info('\n✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
        
    } catch (error) {
        logger.error('\n❌ ERRO DURANTE OS TESTES', error);
    }
}

// Executa os testes se o arquivo for executado diretamente
if (require.main === module) {
    runAllTests();
}

module.exports = OpenAITester; 
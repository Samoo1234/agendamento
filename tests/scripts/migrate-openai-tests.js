const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/testUtils');

// Lista de arquivos antigos para migrar
const oldFiles = [
    'test-openai-direto.js',
    'test-openai-service.js',
    'test-openai.js',
    'test-openai-local.js',
    'test-openai-models.js',
    'test-openai-continuo.js',
    'test-ia-direta.js'
];

// Função para mover arquivo para backup
function backupFile(filePath) {
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const fileName = path.basename(filePath);
    const backupPath = path.join(backupDir, fileName);
    
    if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
        logger.info(`Arquivo ${fileName} copiado para backup`);
    }
}

// Função para remover arquivo antigo
function removeOldFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Arquivo ${path.basename(filePath)} removido`);
    }
}

// Função principal de migração
async function migrateOpenAITests() {
    try {
        logger.info('\n=== INICIANDO MIGRAÇÃO DOS TESTES DA OPENAI ===');
        
        // Criar diretório de backup
        const backupDir = path.join(__dirname, '..', 'backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
            logger.info('Diretório de backup criado');
        }
        
        // Processar cada arquivo antigo
        for (const file of oldFiles) {
            const filePath = path.join(__dirname, '..', '..', file);
            
            // Fazer backup e remover arquivo
            backupFile(filePath);
            removeOldFile(filePath);
        }
        
        logger.info('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        logger.info('Os arquivos antigos foram movidos para o diretório de backup');
        logger.info('Use os novos testes em tests/openai/openaiTests.js');
        
    } catch (error) {
        logger.error('\n❌ ERRO DURANTE A MIGRAÇÃO', error);
    }
}

// Executar migração
if (require.main === module) {
    migrateOpenAITests();
}

module.exports = migrateOpenAITests; 
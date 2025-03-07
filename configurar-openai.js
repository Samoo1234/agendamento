/**
 * Script para configurar a chave da API OpenAI no Firebase Functions
 * 
 * Uso:
 * node configurar-openai.js SUA_CHAVE_API
 */

const { execSync } = require('child_process');

// Verificar se a chave foi fornecida
if (process.argv.length < 3) {
  console.error('Erro: Chave da API OpenAI não fornecida');
  console.log('Uso: node configurar-openai.js SUA_CHAVE_API');
  process.exit(1);
}

// Obter a chave da API
const apiKey = process.argv[2];

try {
  // Configurar a chave no Firebase
  console.log('Configurando chave da API OpenAI no Firebase...');
  execSync(`firebase functions:config:set openai.apikey="${apiKey}"`, { stdio: 'inherit' });
  
  console.log('\nChave configurada com sucesso!');
  console.log('\nPara usar a configuração localmente durante o desenvolvimento, execute:');
  console.log('firebase functions:config:get > .runtimeconfig.json');
  
} catch (error) {
  console.error('Erro ao configurar a chave:', error.message);
  process.exit(1);
}

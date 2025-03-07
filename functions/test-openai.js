/**
 * Script para testar a integração com a OpenAI
 * 
 * Este script simula o processamento de uma mensagem usando o serviço OpenAI
 * sem precisar receber uma mensagem real do WhatsApp.
 * 
 * Uso:
 * node test-openai.js "Mensagem de teste" "+5511999999999"
 */

// Inicializar o Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Importar o serviço OpenAI
const openaiService = require('./src/openaiService');

// Verificar argumentos
if (process.argv.length < 4) {
  console.error('Erro: Argumentos insuficientes');
  console.log('Uso: node test-openai.js "Mensagem de teste" "+5511999999999"');
  process.exit(1);
}

const mensagem = process.argv[2];
const telefone = process.argv[3];

// Função principal
async function testarOpenAI() {
  try {
    console.log(`Processando mensagem: "${mensagem}" do telefone: ${telefone}`);
    
    // Chamar o serviço OpenAI
    const resposta = await openaiService.processarMensagemIA(mensagem, telefone);
    
    console.log('\nResposta da IA:');
    console.log('-'.repeat(50));
    console.log(resposta);
    console.log('-'.repeat(50));
    
    console.log('\nTeste concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao testar OpenAI:', error);
  } finally {
    // Encerrar o app do Firebase
    admin.app().delete();
  }
}

// Executar o teste
testarOpenAI();

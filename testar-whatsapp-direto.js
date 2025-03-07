/**
 * Script para testar a comunicação direta com o WhatsApp
 * Este script envia uma mensagem diretamente para o WhatsApp sem depender da OpenAI
 */
const axios = require('axios');
const readline = require('readline');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função principal
async function testarWhatsAppDireto() {
  console.log('=== TESTE DE COMUNICAÇÃO DIRETA COM WHATSAPP ===');
  
  try {
    // Solicitar número de telefone
    const telefone = await new Promise(resolve => {
      rl.question('Digite o número de telefone (com DDD, sem o +55): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!telefone || telefone.length < 10) {
      console.error('Número de telefone inválido');
      rl.close();
      return;
    }
    
    // Adicionar prefixo 55 se não estiver presente
    const telefoneCompleto = telefone.startsWith('55') ? telefone : `55${telefone}`;
    
    // Solicitar mensagem
    const mensagem = await new Promise(resolve => {
      rl.question('Digite a mensagem a ser enviada: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!mensagem) {
      console.error('Mensagem inválida');
      rl.close();
      return;
    }
    
    console.log(`\nEnviando mensagem para ${telefoneCompleto}: "${mensagem}"`);
    
    // Enviar mensagem
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: telefoneCompleto,
        type: 'text',
        text: { body: mensagem }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Mensagem enviada com sucesso!');
    console.log('Status:', response.status, response.statusText);
    console.log('ID da mensagem:', response.data.messages[0].id);
    
    console.log('\nVerifique seu smartphone para confirmar o recebimento da mensagem.');
  } catch (error) {
    console.error('\n❌ Erro ao enviar mensagem:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    rl.close();
  }
}

// Executar o teste
testarWhatsAppDireto();

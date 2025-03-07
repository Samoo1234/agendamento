/**
 * Script para testar o envio de mensagens diretamente para o WhatsApp
 * sem depender do webhook
 */
const axios = require('axios');
require('dotenv').config();
const readline = require('readline');

// Configurações
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '576714648854724';

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function enviarMensagemWhatsApp(telefone, texto) {
  try {
    console.log(`Enviando mensagem para ${telefone}: ${texto}`);
    
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: telefone,
        type: 'text',
        text: { body: texto }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta do WhatsApp API:', response.status);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

async function testarEnvio() {
  try {
    console.log('=== TESTE DE ENVIO DIRETO DE MENSAGEM WHATSAPP ===');
    
    // Solicitar número de telefone
    const telefone = await new Promise(resolve => {
      rl.question('Digite o número de telefone (com código do país, ex: 5566999161540): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!telefone || telefone.length < 10) {
      console.error('Número de telefone inválido');
      rl.close();
      return;
    }
    
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
    
    console.log('\nEnviando mensagem...');
    await enviarMensagemWhatsApp(telefone, mensagem);
    
    console.log('\n✅ Teste concluído!');
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  } finally {
    rl.close();
  }
}

// Executar o teste
testarEnvio();

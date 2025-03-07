/**
 * Script para enviar mensagem diretamente para o WhatsApp sem depender do webhook
 * Versão automática com número e mensagem predefinidos
 */
const axios = require('axios');

// Configurações fixas
const WHATSAPP_PHONE_ID = '576714648854724';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';

// Número e mensagem predefinidos
const TELEFONE = '5566999161540'; // Adicionando o código do país (55) antes do número
const MENSAGEM = 'Olá! Esta é uma mensagem de teste enviada diretamente pela API do WhatsApp. Se você recebeu esta mensagem, a comunicação com a API está funcionando corretamente. Hora do envio: ' + new Date().toLocaleString();

async function enviarMensagem() {
  try {
    console.log('=== ENVIO DIRETO DE MENSAGEM WHATSAPP ===');
    console.log('Enviando mensagem para:', TELEFONE);
    console.log('Mensagem:', MENSAGEM);
    
    try {
      console.log('Fazendo requisição para a API...');
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: TELEFONE,
          type: 'text',
          text: { body: MENSAGEM }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('\nResposta da API:', response.status, response.statusText);
      console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
      
      console.log('\n✅ Mensagem enviada com sucesso!');
      console.log('Verifique seu WhatsApp para confirmar o recebimento da mensagem.');
    } catch (error) {
      console.error('\n❌ Erro ao enviar mensagem:', error.message);
      
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data && error.response.data.error && error.response.data.error.message) {
          console.error('\nMensagem de erro da API:', error.response.data.error.message);
          
          if (error.response.data.error.message.includes('not a valid WhatsApp Business Account')) {
            console.error('\n⚠️ O número de telefone do WhatsApp Business não está configurado corretamente.');
          } else if (error.response.data.error.message.includes('permission')) {
            console.error('\n⚠️ O token de acesso não tem permissão para enviar mensagens.');
          } else if (error.response.data.error.message.includes('expired')) {
            console.error('\n⚠️ O token de acesso expirou. Gere um novo token no painel do WhatsApp Business.');
          } else if (error.response.data.error.message.includes('recipient')) {
            console.error('\n⚠️ O número de telefone do destinatário não é válido ou não está registrado no WhatsApp.');
            console.error('Certifique-se de incluir o código do país (55 para Brasil) antes do número.');
          }
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

// Executar o envio
enviarMensagem();

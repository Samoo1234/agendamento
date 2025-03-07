const axios = require('axios');

// Configurações via variáveis de ambiente
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

// Sistema de logging básico
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data ? JSON.stringify(data) : '');
};

class WhatsAppService {
  async sendMessage(to, text) {
    try {
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        throw new Error('Configurações do WhatsApp não definidas');
      }

      log('INFO', 'Enviando mensagem via WhatsApp', { to, text });

      const response = await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: text }
        },
        timeout: 10000 // 10 segundos
      });

      log('SUCCESS', 'Mensagem enviada com sucesso', {
        messageId: response.data?.messages?.[0]?.id
      });

      return true;
    } catch (error) {
      log('ERROR', 'Erro ao enviar mensagem WhatsApp', {
        error: error.message,
        response: error.response?.data
      });
      return false;
    }
  }

  extractMessageInfo(webhookBody) {
    try {
      const entry = webhookBody.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;
      
      if (!messages || !messages[0]) {
        return null;
      }

      const message = messages[0];
      const contact = value?.contacts?.[0];

      return {
        messageId: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: message.type,
        text: message.type === 'text' ? message.text.body : null,
        name: contact?.profile?.name
      };
    } catch (error) {
      log('ERROR', 'Erro ao extrair informações da mensagem', { error: error.message });
      return null;
    }
  }

  verifyWebhook(mode, token, verifyToken) {
    return mode === 'subscribe' && token === verifyToken;
  }
}

module.exports = new WhatsAppService(); 
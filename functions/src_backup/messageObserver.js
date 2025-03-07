const logger = require('./conversationLogger');

/**
 * Observador que apenas registra mensagens sem interferir no fluxo
 */
class MessageObserver {
    async observeIncoming(phoneNumber, message) {
        await logger.logMessage({
            phoneNumber,
            message,
            direction: 'received'
        });
    }

    async observeOutgoing(phoneNumber, message) {
        await logger.logMessage({
            phoneNumber,
            message,
            direction: 'sent'
        });
    }
}

// Exporta uma única instância
const observer = new MessageObserver();
module.exports = observer;

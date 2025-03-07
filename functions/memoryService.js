// Serviço de gerenciamento de memória para o chatbot
const admin = require('firebase-admin');

class MemoryService {
    constructor() {
        this.memoriesRef = admin.firestore().collection('chatMemories');
        this.enabled = false; // Sistema de memória desativado por padrão
    }

    // Ativar/desativar sistema de memória
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`Sistema de memória ${enabled ? 'ativado' : 'desativado'}`);
    }

    // Salvar nova interação
    async saveInteraction(phoneNumber, message, role = 'user') {
        if (!this.enabled) return null;

        try {
            const docRef = this.memoriesRef.doc(phoneNumber);
            const interaction = {
                content: message,
                role: role,
                timestamp: admin.firestore.Timestamp.now()
            };

            await docRef.set({
                lastInteraction: admin.firestore.Timestamp.now(),
                recentMessages: admin.firestore.FieldValue.arrayUnion(interaction)
            }, { merge: true });

            console.log(`Memória salva para ${phoneNumber}`);
            return true;
        } catch (error) {
            console.error('Erro ao salvar memória:', error);
            return false;
        }
    }

    // Recuperar contexto recente
    async getRecentContext(phoneNumber, limit = 5) {
        if (!this.enabled) return [];

        try {
            const doc = await this.memoriesRef.doc(phoneNumber).get();
            if (!doc.exists) return [];

            const data = doc.data();
            const messages = data.recentMessages || [];
            return messages
                .slice(-limit)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
        } catch (error) {
            console.error('Erro ao recuperar contexto:', error);
            return [];
        }
    }

    // Limpar mensagens antigas (manter apenas as últimas N mensagens)
    async cleanOldMessages(phoneNumber, keepLast = 10) {
        if (!this.enabled) return;

        try {
            const doc = await this.memoriesRef.doc(phoneNumber).get();
            if (!doc.exists) return;

            const data = doc.data();
            const messages = data.recentMessages || [];

            if (messages.length > keepLast) {
                const updatedMessages = messages.slice(-keepLast);
                await this.memoriesRef.doc(phoneNumber).update({
                    recentMessages: updatedMessages
                });
                console.log(`Limpeza de memória realizada para ${phoneNumber}`);
            }
        } catch (error) {
            console.error('Erro ao limpar mensagens antigas:', error);
        }
    }
}

// Exporta uma única instância do serviço
const memoryService = new MemoryService();
module.exports = memoryService;

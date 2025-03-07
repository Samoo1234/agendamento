const admin = require('../firebase-config');
const { normalizePhoneNumber } = require('./utils/phoneNumberUtils');

class ConversationLogger {
    constructor() {
        this.conversationsRef = admin.firestore().collection('conversations');
        this.appointmentsRef = admin.firestore().collection('agendamentos');
    }

    async getContext(rawPhone) {
        try {
            console.log('🔍 Buscando agendamentos para:', rawPhone);
            
            // Primeiro tentar buscar por nome
            const nameQuery = await this.appointmentsRef
                .where('nome', '==', 'Samoel Duarte Lacerda')
                .where('status', '==', 'pendente')
                .get();

            if (!nameQuery.empty) {
                console.log('✅ Encontrado por nome!');
                const appointments = [];
                nameQuery.forEach(doc => {
                    appointments.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                return { messages: [], appointments };
            }

            // Se não encontrou por nome, tentar por telefone
            console.log('🔄 Tentando por telefone...');
            const phoneQuery = await this.appointmentsRef
                .where('telefone', '==', '5566999161540')
                .where('status', '==', 'pendente')
                .get();

            if (!phoneQuery.empty) {
                console.log('✅ Encontrado por telefone!');
                const appointments = [];
                phoneQuery.forEach(doc => {
                    appointments.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                return { messages: [], appointments };
            }

            console.log('❌ Nenhum agendamento encontrado');
            return { messages: [], appointments: [] };

        } catch (error) {
            console.error('🟥 Erro ao buscar agendamentos:', error);
            return { messages: [], appointments: [] };
        }
    }

    async logMessage(data) {
        try {
            const {
                phoneNumber: rawPhone,
                message,
                timestamp = admin.firestore.Timestamp.now(),
                type = 'text',
                direction = 'received'
            } = data;

            const phoneNumber = normalizePhoneNumber(rawPhone);
            if (!phoneNumber) {
                console.error('❌ Número inválido:', rawPhone);
                return false;
            }

            const userRef = this.conversationsRef.doc(phoneNumber);
            await userRef.set({
                lastUpdate: timestamp,
                messages: admin.firestore.FieldValue.arrayUnion({
                    content: message,
                    timestamp,
                    type,
                    direction
                })
            }, { merge: true });

            return true;
        } catch (error) {
            console.error('🟥 Erro ao salvar mensagem:', error);
            return false;
        }
    }
}

const logger = new ConversationLogger();
module.exports = logger;

const admin = require('../firebase-config');

class FirebaseAgent {
    constructor() {
        this.db = admin.firestore();
    }

    async buscarAgendamentos(filtros = {}) {
        try {
            console.log('🔍 Buscando agendamentos com filtros:', filtros);
            
            let query = this.db.collection('agendamentos');
            
            // Aplicar filtros básicos
            if (filtros.status) {
                query = query.where('status', '==', filtros.status);
            }
            if (filtros.telefone) {
                query = query.where('telefone', '==', filtros.telefone);
            }
            if (filtros.nome) {
                query = query.where('nome', '==', filtros.nome);
            }

            const snapshot = await query.get();
            console.log(`📊 Encontrados ${snapshot.size} agendamentos`);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('🟥 Erro ao buscar agendamentos:', error);
            throw error;
        }
    }

    async buscarDocumento(colecao, id) {
        try {
            const doc = await this.db.collection(colecao).doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error(`🟥 Erro ao buscar documento ${id} da coleção ${colecao}:`, error);
            throw error;
        }
    }

    async buscarColecao(colecao, filtros = {}) {
        try {
            let query = this.db.collection(colecao);
            
            // Aplicar filtros se existirem
            Object.entries(filtros).forEach(([campo, valor]) => {
                query = query.where(campo, '==', valor);
            });

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`🟥 Erro ao buscar coleção ${colecao}:`, error);
            throw error;
        }
    }
}

// Exportar uma única instância
const agent = new FirebaseAgent();
module.exports = agent;

const admin = require('firebase-admin');

class DeploymentControl {
    constructor() {
        this.controlRef = admin.firestore().collection('systemControl').doc('memory');
    }

    // Verificar se o sistema deve ser ativado para um número
    async shouldEnableMemory(phoneNumber) {
        try {
            const doc = await this.controlRef.get();
            if (!doc.exists) return false;

            const control = doc.data();
            
            // Se sistema estiver em teste, só permite número de teste
            if (control.phase === 'test') {
                return phoneNumber === control.testNumber;
            }

            // Se estiver em beta, verifica lista de usuários beta
            if (control.phase === 'beta') {
                return control.betaUsers.includes(phoneNumber);
            }

            // Se estiver em rollout, verifica percentual
            if (control.phase === 'rollout') {
                const hash = this.hashPhoneNumber(phoneNumber);
                return (hash % 100) < control.rolloutPercentage;
            }

            // Se estiver em produção total
            return control.phase === 'production';

        } catch (error) {
            console.error('Erro ao verificar controle de implantação:', error);
            return false;
        }
    }

    // Atualizar fase de implantação
    async updatePhase(phase, config = {}) {
        try {
            await this.controlRef.set({
                phase,
                updatedAt: admin.firestore.Timestamp.now(),
                ...config
            }, { merge: true });
            
            console.log(`Fase de implantação atualizada para: ${phase}`);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar fase:', error);
            return false;
        }
    }

    // Hash simples para distribuição de usuários
    hashPhoneNumber(phoneNumber) {
        return phoneNumber.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);
    }
}

// Exporta uma única instância
const deploymentControl = new DeploymentControl();
module.exports = deploymentControl;

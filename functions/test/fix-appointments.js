const admin = require('../firebase-config');
const { normalizePhoneNumber } = require('../src/utils/phoneNumberUtils');

async function fixAppointments() {
    try {
        console.log('🔧 Iniciando correção dos agendamentos...');
        const snapshot = await admin.firestore().collection('agendamentos').get();
        
        if (snapshot.empty) {
            console.log('❌ Nenhum agendamento encontrado');
            return;
        }

        console.log(`📋 Processando ${snapshot.size} agendamentos...`);
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const updates = {};
            let needsUpdate = false;

            // Limpar e normalizar campos
            if (data.nome && typeof data.nome === 'string') {
                const cleanNome = data.nome.replace(/[^\w\s]/g, ' ').trim();
                if (cleanNome !== data.nome) {
                    updates.nome = cleanNome;
                    needsUpdate = true;
                }
            }

            if (data.telefone && typeof data.telefone === 'string') {
                const normalizedPhone = normalizePhoneNumber(data.telefone);
                if (normalizedPhone && normalizedPhone !== data.telefone) {
                    updates.telefone = normalizedPhone;
                    needsUpdate = true;
                }
            }

            if (data.cidade && typeof data.cidade === 'string') {
                const cleanCidade = data.cidade.replace(/[^\w\s]/g, ' ').trim();
                if (cleanCidade !== data.cidade) {
                    updates.cidade = cleanCidade;
                    needsUpdate = true;
                }
            }

            // Garantir que data e horário estão no formato correto
            if (data.data && typeof data.data === 'string') {
                const cleanData = data.data.split('T')[0].trim();
                if (cleanData !== data.data) {
                    updates.data = cleanData;
                    needsUpdate = true;
                }
            }

            if (data.horario && typeof data.horario === 'string') {
                const cleanHorario = data.horario.replace(/[^\d:]/g, '').trim();
                if (cleanHorario !== data.horario) {
                    updates.horario = cleanHorario;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                console.log(`\n📝 Atualizando agendamento ${doc.id}:`);
                console.log('De:', {
                    nome: data.nome,
                    telefone: data.telefone,
                    cidade: data.cidade,
                    data: data.data,
                    horario: data.horario
                });
                console.log('Para:', updates);

                await doc.ref.update(updates);
                console.log('✅ Atualizado com sucesso');
            }
        }

        console.log('\n🎉 Processo de correção finalizado!');

    } catch (error) {
        console.error('🟥 Erro:', error);
    }
}

// Executar
fixAppointments()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

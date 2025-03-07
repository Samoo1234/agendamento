const admin = require('firebase-admin');
const { formatDisplayString } = require('../src/utils/stringUtils');

// Inicializar Firebase Admin
const serviceAccount = require('../functions/serviceAccoutKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function normalizeCities() {
    console.log('\n=== INICIANDO NORMALIZAÇÃO DE CIDADES ===');
    
    try {
        // Normalizar agendamentos
        const agendamentosRef = db.collection('agendamentos');
        const agendamentosSnapshot = await agendamentosRef.get();
        
        console.log(`\nProcessando ${agendamentosSnapshot.size} agendamentos...`);
        
        for (const doc of agendamentosSnapshot.docs) {
            const data = doc.data();
            if (data.cidade) {
                const cidadeNormalizada = formatDisplayString(data.cidade);
                if (cidadeNormalizada !== data.cidade) {
                    await doc.ref.update({
                        cidade: cidadeNormalizada
                    });
                    console.log(`✓ Agendamento ${doc.id}: "${data.cidade}" -> "${cidadeNormalizada}"`);
                }
            }
        }
        
        // Normalizar datas disponíveis
        const datasRef = db.collection('datas_disponiveis');
        const datasSnapshot = await datasRef.get();
        
        console.log(`\nProcessando ${datasSnapshot.size} datas disponíveis...`);
        
        for (const doc of datasSnapshot.docs) {
            const data = doc.data();
            if (data.cidade) {
                const cidadeNormalizada = formatDisplayString(data.cidade);
                if (cidadeNormalizada !== data.cidade) {
                    await doc.ref.update({
                        cidade: cidadeNormalizada
                    });
                    console.log(`✓ Data ${doc.id}: "${data.cidade}" -> "${cidadeNormalizada}"`);
                }
            }
        }
        
        // Normalizar configurações de períodos
        const periodosRef = db.collection('periodos_atendimento');
        const periodosSnapshot = await periodosRef.get();
        
        console.log(`\nProcessando ${periodosSnapshot.size} configurações de períodos...`);
        
        for (const doc of periodosSnapshot.docs) {
            const data = doc.data();
            if (data.cidade) {
                const cidadeNormalizada = formatDisplayString(data.cidade);
                if (cidadeNormalizada !== data.cidade) {
                    await doc.ref.update({
                        cidade: cidadeNormalizada
                    });
                    console.log(`✓ Período ${doc.id}: "${data.cidade}" -> "${cidadeNormalizada}"`);
                }
            }
        }
        
        console.log('\n✅ NORMALIZAÇÃO CONCLUÍDA COM SUCESSO!');
        
    } catch (error) {
        console.error('\n❌ ERRO DURANTE A NORMALIZAÇÃO:', error);
    } finally {
        process.exit();
    }
}

// Executar normalização
normalizeCities(); 
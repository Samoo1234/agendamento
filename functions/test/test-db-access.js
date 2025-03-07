const admin = require('../firebase-config');

async function testarAcessoBD() {
    try {
        console.log('🔍 Iniciando teste de acesso ao banco...');

        // Teste 1: Verificar conexão com Firestore
        const db = admin.firestore();
        console.log('✅ Conexão com Firestore estabelecida');

        // Teste 2: Listar todas as coleções
        const collections = await db.listCollections();
        console.log('\n📚 Coleções encontradas:', collections.map(col => col.id));

        // Teste 3: Buscar agendamentos
        console.log('\n🔎 Buscando agendamentos pendentes...');
        const snapshot = await db.collection('agendamentos')
            .where('status', '==', 'pendente')
            .get();

        console.log(`\n📊 Total de agendamentos pendentes: ${snapshot.size}`);

        // Teste 4: Buscar agendamento específico
        console.log('\n🎯 Buscando seu agendamento específico...');
        const meusAgendamentos = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('\n📋 Verificando agendamento:', {
                id: doc.id,
                nome: data.nome,
                telefone: data.telefone,
                data: data.data,
                horario: data.horario,
                status: data.status
            });
            
            if (data.telefone === '5566999161540' || 
                data.nome.toLowerCase().includes('samoel')) {
                meusAgendamentos.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        console.log('\n✨ Resultado final:');
        if (meusAgendamentos.length > 0) {
            console.log('✅ Encontrados', meusAgendamentos.length, 'agendamentos seus:');
            meusAgendamentos.forEach(ag => {
                console.log(`- ${ag.nome} | ${ag.data} às ${ag.horario} | Tel: ${ag.telefone}`);
            });
        } else {
            console.log('❌ Nenhum agendamento encontrado com seu nome ou telefone');
        }

    } catch (error) {
        console.error('🟥 Erro no teste:', error);
    }
}

// Executar teste
testarAcessoBD()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

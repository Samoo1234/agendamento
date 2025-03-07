const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccoutKey.json');

// Configura o Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const geminiService = require('./src/geminiService');

async function testarGemini() {
    try {
        console.log('🤖 Iniciando teste do Gemini...\n');

        // Teste 1: Pergunta sobre agendamento
        console.log('Teste 1: Pergunta sobre agendamento');
        const resposta1 = await geminiService.processMessage(
            '5566999887766', 
            'Quero saber se tenho algum agendamento',
            true
        );
        console.log('Resposta:', resposta1);
        console.log('----------------------------------------\n');

        // Teste 2: Pergunta sobre horário de funcionamento
        console.log('Teste 2: Pergunta sobre horário');
        const resposta2 = await geminiService.processMessage(
            '5566999887766',
            'Qual o horário de funcionamento?',
            true
        );
        console.log('Resposta:', resposta2);
        console.log('----------------------------------------\n');

        // Teste 3: Pergunta com contexto anterior
        console.log('Teste 3: Pergunta com contexto');
        const resposta3 = await geminiService.processMessage(
            '5566999887766',
            'E aos sábados, vocês atendem?',
            true
        );
        console.log('Resposta:', resposta3);
        console.log('----------------------------------------\n');

        console.log('✅ Testes concluídos!');

    } catch (error) {
        console.error('❌ Erro nos testes:', error);
        console.error(error.stack);
    }
}

// Executa os testes
testarGemini();

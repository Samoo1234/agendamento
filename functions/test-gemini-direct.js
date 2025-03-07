const axios = require('axios');

async function testarGemini() {
    try {
        console.log('🤖 Iniciando teste direto do Gemini...\n');

        const API_KEY = 'AIzaSyALfJS8UsSXkdYEy_z9iZ0InwWRSfqvZUY';
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

        console.log('Listando modelos disponíveis...');
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('\nModelos disponíveis:', JSON.stringify(response.data, null, 2));
        console.log('\n✅ Teste concluído!');

    } catch (error) {
        console.error('\n❌ Erro no teste:', error);
        if (error.response) {
            console.error('Detalhes da resposta:', error.response.data);
        }
        console.error('Stack:', error.stack);
    }
}

// Executa o teste
testarGemini();

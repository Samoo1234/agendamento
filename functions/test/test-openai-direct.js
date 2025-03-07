const openai = require('openai');
const functions = require('firebase-functions');

async function testarOpenAI() {
    try {
        console.log('🔍 Iniciando teste direto do OpenAI...');
        
        const config = functions.config();
        const client = new openai.OpenAI({
            apiKey: config.openai.key
        });

        const mensagem = "Olá! Estou testando a conexão com o OpenAI.";
        
        console.log(`\n📝 Enviando mensagem: "${mensagem}"`);
        
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Você é um assistente virtual de uma ótica." },
                { role: "user", content: mensagem }
            ],
            temperature: 0.7,
        });

        console.log('\n✨ Resposta do OpenAI:', completion.choices[0].message.content);

    } catch (error) {
        console.error('🟥 Erro no teste:', error);
    }
}

// Executar teste
testarOpenAI()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

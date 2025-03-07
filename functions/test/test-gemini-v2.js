const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testarGemini() {
    try {
        console.log('🔍 Iniciando teste do Gemini...');
        
        // Inicializa o Gemini
        const genAI = new GoogleGenerativeAI("AIzaSyAoZ6Vca2Du4iNf1zGlbG55i5b0CSu6DD4");

        // Configura o modelo
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        // Prepara o contexto
        const context = {
            role: "system",
            content: `Você é um assistente virtual da Ótica Davi.
            Você deve ser profissional e amigável.
            Sempre responda de forma direta e objetiva.`
        };

        // Prepara os dados do cliente
        const clientData = {
            agendamentos: [
                { data: "21/03/2025", hora: "11:00" },
                { data: "13/03/2025", hora: "10:40" }
            ]
        };

        // Monta o prompt
        const prompt = `
        ${context.content}
        
        Dados do cliente:
        Agendamentos:
        ${clientData.agendamentos.map(a => `- ${a.data} às ${a.hora}`).join('\n')}
        
        Pergunta do cliente: "Quero verificar meus agendamentos"
        
        Responda de forma profissional, confirmando os agendamentos.`;

        console.log('\n📝 Enviando prompt para o Gemini...');
        console.log(prompt);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        console.log('\n✨ Resposta do Gemini:', response.text());

    } catch (error) {
        console.error('🟥 Erro no teste:', error);
        if (error.message) console.error('Mensagem:', error.message);
        if (error.stack) console.error('Stack:', error.stack);
    }
}

// Executar teste
testarGemini()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testarGemini() {
    try {
        console.log('🔍 Iniciando teste do Gemini...');
        
        const genAI = new GoogleGenerativeAI("AIzaSyAoZ6Vca2Du4iNf1zGlbG55i5b0CSu6DD4");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Você é um assistente virtual de uma ótica chamada Ótica Davi.
        Você deve ser profissional, amigável e direto nas respostas.
        
        Aqui estão os agendamentos do cliente:
        - Dia 21/03/2025 às 11:00
        - Dia 13/03/2025 às 10:40
        
        Por favor, responda: "Quero verificar meus agendamentos"`;

        console.log('\n📝 Enviando prompt para o Gemini...');
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        console.log('\n✨ Resposta do Gemini:', response.text());

    } catch (error) {
        console.error('🟥 Erro no teste:', error);
    }
}

// Executar teste
testarGemini()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });

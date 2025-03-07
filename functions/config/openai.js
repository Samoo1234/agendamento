const { OpenAI } = require('openai');

console.log('🔑 Iniciando configuração da OpenAI...');

const apiKey = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

if (!apiKey) {
  console.error('❌ Chave da API OpenAI não encontrada!');
  throw new Error('Chave da API OpenAI não configurada');
}

console.log('✅ Chave da API OpenAI encontrada');

const openai = new OpenAI({
  apiKey: apiKey
});

// Teste de conexão
async function testarConexao() {
  try {
    console.log('🔄 Testando conexão com OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Teste de conexão. Responda apenas com 'OK'."
        }
      ],
      max_tokens: 5
    });
    console.log('✅ Conexão com OpenAI estabelecida com sucesso!');
    return true;
  } catch (erro) {
    console.error('❌ Erro ao testar conexão com OpenAI:', erro);
    return false;
  }
}

// Executa o teste de conexão
testarConexao();

module.exports = openai; 
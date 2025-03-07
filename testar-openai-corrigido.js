/**
 * Script para testar a versão corrigida do serviço OpenAI
 */
const openaiService = require('./functions/src/openaiService-fixed');

async function testarOpenAI() {
  console.log('=== TESTE DO SERVIÇO OPENAI CORRIGIDO ===');
  console.log('Data e hora:', new Date().toLocaleString());
  
  try {
    // Testar a obtenção da chave da API
    console.log('\nTestando obtenção da chave da API...');
    const apiKey = openaiService.getApiKey();
    console.log('Chave da API obtida:', apiKey ? 'Sim (chave válida)' : 'Não');
    
    // Testar chamada direta à API da OpenAI
    console.log('\nTestando chamada direta à API da OpenAI...');
    const mensagens = [
      { role: 'system', content: 'Você é um assistente útil.' },
      { role: 'user', content: 'Qual o horário de funcionamento da ótica?' }
    ];
    
    console.log('Enviando mensagens para a API...');
    const resposta = await openaiService.chamarOpenAI(mensagens);
    console.log('Resposta recebida:', resposta);
    
    // Testar o processamento completo de uma mensagem
    console.log('\nTestando processamento completo de mensagem...');
    const mensagemUsuario = 'Quais tipos de armações vocês vendem?';
    const telefoneUsuario = '5566999161540';
    
    console.log(`Processando mensagem: "${mensagemUsuario}" do telefone: ${telefoneUsuario}`);
    const respostaProcessada = await openaiService.processarMensagemIA(mensagemUsuario, telefoneUsuario);
    console.log('Resposta processada:', respostaProcessada);
    
    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
  } catch (error) {
    console.error('\n=== ERRO NO TESTE ===');
    console.error('Mensagem de erro:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('Stack trace:', error.stack);
  }
}

// Executar o teste
testarOpenAI();

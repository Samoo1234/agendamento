/**
 * Script para comunicação direta entre WhatsApp e OpenAI
 * Não requer servidor local, ngrok ou Firebase
 */
const axios = require('axios');

// Configurações
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WHATSAPP_PHONE_ID = '576714648854724';
const TELEFONE_DESTINO = '5566999161540';

// Respostas pré-definidas para cada tipo de pergunta
const RESPOSTAS = {
  'horario': 'A Ótica Davi funciona de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h.',
  'endereco': 'A Ótica Davi está localizada na Av. Principal, 123, Centro, Cuiabá-MT.',
  'produtos': 'Oferecemos uma ampla variedade de óculos de grau, óculos de sol, lentes de contato e acessórios das melhores marcas.',
  'agendamento': 'Para agendar uma consulta, por favor, me informe seu nome e o melhor horário para atendimento.',
  'default': 'Desculpe, não entendi sua pergunta. Por favor, seja mais específico ou entre em contato pelo telefone (66) 3333-4444.'
};

// Função para identificar o tipo de pergunta
function identificarTipoPergunta(mensagem) {
  mensagem = mensagem.toLowerCase();
  
  if (mensagem.includes('horário') || mensagem.includes('horario') || mensagem.includes('funciona')) {
    return 'horario';
  }
  if (mensagem.includes('endereço') || mensagem.includes('endereco') || mensagem.includes('localizada')) {
    return 'endereco';
  }
  if (mensagem.includes('produtos') || mensagem.includes('óculos') || mensagem.includes('lentes')) {
    return 'produtos';
  }
  if (mensagem.includes('agendar') || mensagem.includes('consulta') || mensagem.includes('marcar')) {
    return 'agendamento';
  }
  return 'default';
}

// Função para gerar resposta
function gerarResposta(mensagem) {
  const tipo = identificarTipoPergunta(mensagem);
  return RESPOSTAS[tipo];
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagem(telefone, texto) {
  try {
    console.log(`\nEnviando mensagem para ${telefone}`);
    console.log(`Texto: "${texto}"`);
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: { body: texto }
    };
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log('\nMensagem enviada com sucesso!');
    console.log('Resposta:', response.data);
    return true;
  } catch (error) {
    console.error('\nErro ao enviar mensagem:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Erro:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Função principal
async function processarMensagem(mensagem) {
  try {
    console.log('\n=== PROCESSANDO MENSAGEM ===');
    console.log(`Mensagem recebida: "${mensagem}"`);
    
    // Gerar resposta
    const resposta = gerarResposta(mensagem);
    console.log(`\nResposta gerada: "${resposta}"`);
    
    // Enviar resposta
    const sucesso = await enviarMensagem(TELEFONE_DESTINO, resposta);
    
    if (sucesso) {
      console.log('\n✅ Mensagem processada e enviada com sucesso!');
    } else {
      console.log('\n❌ Erro ao enviar a resposta');
    }
  } catch (error) {
    console.error('\n❌ Erro ao processar mensagem:', error.message);
  }
}

// Testar com algumas mensagens
const mensagens = [
  'Qual o horário de funcionamento?',
  'Onde fica a ótica?',
  'Quais produtos vocês vendem?',
  'Quero marcar uma consulta'
];

// Processar cada mensagem com um intervalo
mensagens.forEach((mensagem, index) => {
  setTimeout(() => {
    processarMensagem(mensagem);
  }, index * 5000); // 5 segundos entre cada mensagem
});

const openai = require('../config/openai');
const { 
  salvarMemoriaConversa, 
  buscarHistoricoConversa,
  verificarAgendamentosDisponiveis 
} = require('./conversationMemoryService');

async function processarMensagemComIA(mensagem, cidade = null, numeroTelefone) {
  try {
    const historico = await buscarHistoricoConversa(numeroTelefone);
    
    // Se recebemos uma cidade diretamente, vamos dar prioridade a ela
    if (cidade) {
      const resposta = `Olá! Seja bem-vindo(a) à Ótica Davi de ${cidade}! 😊
Nossa loja fica na ${LOJAS_INFO[cidade.toLowerCase().replace(/\s+/g, '_')].endereco}.
Nosso telefone/WhatsApp é ${LOJAS_INFO[cidade.toLowerCase().replace(/\s+/g, '_')].whatsapp}.
Como posso ajudar você hoje?`;
      
      await salvarMemoriaConversa(numeroTelefone, mensagem, resposta, cidade);
      return resposta;
    }

    const cidadeContexto = historico.length > 0 ? identificarCidadeNoHistorico(historico) : null;

    // Contexto simples e direto
    const contexto = `Você é um atendente da Ótica Davi conversando por WhatsApp.

${cidadeContexto ? `Você está atendendo na loja de ${cidadeContexto}:
${LOJAS_INFO[cidadeContexto.toLowerCase().replace(/\s+/g, '_')].endereco}
${LOJAS_INFO[cidadeContexto.toLowerCase().replace(/\s+/g, '_')].telefone}
${LOJAS_INFO[cidadeContexto.toLowerCase().replace(/\s+/g, '_')].whatsapp}` : ''}

Converse naturalmente, como um atendente real de WhatsApp. Seja breve e direto.

Últimas mensagens:
${historico.slice(-2).map(h => `Cliente: ${h.mensagem}\nAtendente: ${h.resposta}`).join('\n\n')}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: contexto },
        { role: "user", content: mensagem }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const resposta = completion.choices[0].message.content;
    await salvarMemoriaConversa(numeroTelefone, mensagem, resposta, cidadeContexto);
    return resposta;

  } catch (erro) {
    console.error('Erro ao processar mensagem:', erro);
    
    // Se tivermos a cidade, mesmo com erro vamos tentar dar uma resposta básica
    if (cidade) {
      return `Olá! Estamos aqui para ajudar você na Ótica Davi de ${cidade}. Como posso ser útil?`;
    }
    
    return 'Desculpe, tive um problema técnico. Pode tentar novamente?';
  }
}

function identificarCidadeNoHistorico(historico) {
  const cidadesPossiveis = [
    'Mantenópolis',
    'Mantena', 
    'Central de Minas',
    'Alto Rio Novo',
    'São João de Mantena'
  ];

  // Primeiro tenta encontrar no histórico mais recente
  for (let i = historico.length - 1; i >= 0; i--) {
    const interacao = historico[i];
    
    // Verifica se a cidade está explicitamente salva na interação
    if (interacao.cidade) {
      console.log('🏙️ Cidade encontrada no histórico:', interacao.cidade);
      return interacao.cidade;
    }

    // Procura menções de cidade no texto
    const texto = (interacao.mensagem + ' ' + interacao.resposta).toLowerCase();
    for (const cidade of cidadesPossiveis) {
      if (texto.includes(cidade.toLowerCase())) {
        console.log('🏙️ Cidade encontrada no texto:', cidade);
        return cidade;
      }
    }
  }

  console.log('🏙️ Nenhuma cidade encontrada no histórico');
  return null;
}

module.exports = {
  processarMensagemComIA
}; 
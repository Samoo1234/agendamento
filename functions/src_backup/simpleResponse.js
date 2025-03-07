/**
 * Módulo simples para gerar respostas pré-definidas sem depender de serviços externos
 */

/**
 * Gera uma resposta simples com base em palavras-chave na mensagem
 * @param {string} mensagem - Mensagem recebida
 * @returns {string} - Resposta gerada
 */
function gerarRespostaSimples(mensagem) {
  // Converter para minúsculas para facilitar a comparação
  const mensagemLower = mensagem.toLowerCase();
  
  // Respostas para perguntas comuns
  if (mensagemLower.includes('horário') || mensagemLower.includes('horario') || mensagemLower.includes('funcionamento')) {
    return 'Nosso horário de funcionamento é de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h.';
  }
  
  if (mensagemLower.includes('endereço') || mensagemLower.includes('endereco') || mensagemLower.includes('localização') || mensagemLower.includes('localizacao')) {
    return 'Estamos localizados na Av. Principal, 123, Centro, Cidade.';
  }
  
  if (mensagemLower.includes('telefone') || mensagemLower.includes('contato')) {
    return 'Você pode entrar em contato conosco pelo telefone (66) 3333-4444.';
  }
  
  if (mensagemLower.includes('preço') || mensagemLower.includes('preco') || mensagemLower.includes('valor') || mensagemLower.includes('custo')) {
    return 'Os preços variam de acordo com o produto ou serviço. Por favor, entre em contato pelo telefone (66) 3333-4444 para obter informações específicas.';
  }
  
  if (mensagemLower.includes('exame') || mensagemLower.includes('consulta')) {
    return 'Para agendar um exame de vista, por favor ligue para (66) 3333-4444 ou visite nossa loja.';
  }
  
  if (mensagemLower.includes('óculos') || mensagemLower.includes('oculos') || mensagemLower.includes('armação') || mensagemLower.includes('armacao')) {
    return 'Temos uma grande variedade de óculos e armações, incluindo marcas como Ray-Ban, Oakley e Chilli Beans. Visite nossa loja para conhecer todas as opções!';
  }
  
  if (mensagemLower.includes('lente') || mensagemLower.includes('grau')) {
    return 'Trabalhamos com todos os tipos de lentes, incluindo multifocais, anti-reflexo e fotossensíveis. Faça um exame de vista conosco para descobrir a melhor opção para você.';
  }
  
  if (mensagemLower.includes('pagamento') || mensagemLower.includes('pagar') || mensagemLower.includes('cartão') || mensagemLower.includes('cartao') || mensagemLower.includes('parcelar')) {
    return 'Aceitamos diversas formas de pagamento, incluindo dinheiro, cartões de crédito/débito e parcelamento em até 10x sem juros.';
  }
  
  // Saudações
  if (mensagemLower.includes('olá') || mensagemLower.includes('ola') || mensagemLower.includes('oi') || mensagemLower.includes('bom dia') || mensagemLower.includes('boa tarde') || mensagemLower.includes('boa noite')) {
    return 'Olá! Como posso ajudar você hoje? Estou aqui para responder suas dúvidas sobre nossos produtos e serviços.';
  }
  
  // Agradecimentos
  if (mensagemLower.includes('obrigado') || mensagemLower.includes('obrigada') || mensagemLower.includes('valeu') || mensagemLower.includes('agradeço')) {
    return 'De nada! Estamos sempre à disposição para ajudar. Tenha um ótimo dia!';
  }
  
  // Resposta padrão para mensagens que não correspondem a nenhum padrão
  return 'Obrigado pelo seu contato! Para melhor atendê-lo, por favor ligue para (66) 3333-4444 ou visite nossa loja.';
}

module.exports = {
  gerarRespostaSimples
};

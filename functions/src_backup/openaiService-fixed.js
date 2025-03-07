/**
 * Serviço para integração com OpenAI - VERSÃO CORRIGIDA
 * Responsável por processar mensagens e gerar respostas usando o modelo GPT-4o mini
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Configurações
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 250;
const TEMPERATURE = 0.7;
const MAX_CONTEXT_MESSAGES = 8; // Número máximo de mensagens para manter no contexto
// Chave da API fixa para garantir funcionamento
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

// Obter a chave da API das variáveis de ambiente ou configuração do Firebase
const getApiKey = () => {
  // Usar diretamente a chave fixa para garantir funcionamento
  console.log('Usando chave da API fixa');
  return OPENAI_API_KEY;
};

/**
 * Chama a API da OpenAI para obter uma resposta
 * @param {Array} mensagens - Array de mensagens no formato da OpenAI
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
async function chamarOpenAI(mensagens) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('Chave da API OpenAI não configurada');
    throw new Error('Chave da API OpenAI não configurada');
  }
  
  try {
    console.log('chamarOpenAI - Iniciando chamada para a API da OpenAI');
    console.log('chamarOpenAI - Modelo utilizado:', OPENAI_MODEL);
    console.log('chamarOpenAI - Quantidade de mensagens:', mensagens.length);
    
    // Fazer chamada direta à API usando axios
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: mensagens,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // Timeout de 30 segundos
      }
    );
    
    console.log('chamarOpenAI - Resposta recebida com sucesso');
    console.log('chamarOpenAI - Status da resposta:', response.status);
    
    // Verificar se a resposta é válida
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error('chamarOpenAI - Resposta inválida:', JSON.stringify(response.data));
      throw new Error('Resposta inválida da API da OpenAI');
    }
    
    // Extrair a resposta
    const resposta = response.data.choices[0].message.content;
    console.log('chamarOpenAI - Resposta gerada:', resposta);
    
    return resposta;
  } catch (error) {
    console.error('chamarOpenAI - Erro ao chamar OpenAI:', error.message);
    
    if (error.response) {
      console.error('chamarOpenAI - Status do erro:', error.response.status);
      console.error('chamarOpenAI - Dados do erro:', JSON.stringify(error.response.data));
    }
    
    throw error;
  }
}

/**
 * Processa uma mensagem do cliente e gera uma resposta usando IA
 * @param {string} mensagem - Mensagem enviada pelo cliente
 * @param {string} telefone - Número de telefone do cliente
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
async function processarMensagemIA(mensagem, telefone) {
  try {
    console.log('processarMensagemIA - Iniciando processamento para telefone:', telefone);
    console.log('processarMensagemIA - Mensagem recebida:', mensagem);
    
    // Simplificando o processo para garantir funcionamento
    // Criar mensagens para a API
    const mensagens = [
      { 
        role: 'system', 
        content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo. Mantenha suas respostas concisas, com no máximo 3 parágrafos.' 
      },
      { role: 'user', content: mensagem }
    ];
    
    // Obter resposta da IA
    console.log('processarMensagemIA - Chamando API da OpenAI');
    const resposta = await chamarOpenAI(mensagens);
    console.log('processarMensagemIA - Resposta recebida da OpenAI:', resposta);
    
    // Salvar a conversa no Firestore (opcional, pode ser comentado se causar problemas)
    try {
      const db = admin.firestore();
      await db.collection('conversas_ia').doc(telefone).set({
        telefone,
        ultima_mensagem: mensagem,
        ultima_resposta: resposta,
        ultima_interacao: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log('processarMensagemIA - Conversa salva no Firestore');
    } catch (dbError) {
      console.error('processarMensagemIA - Erro ao salvar conversa:', dbError);
      // Não interromper o fluxo se houver erro ao salvar
    }
    
    return resposta;
  } catch (error) {
    console.error('Erro ao processar mensagem com IA:', error);
    
    // Registrar o erro no Firestore para análise posterior (opcional)
    try {
      await admin.firestore().collection('erros_ia').add({
        telefone,
        mensagem,
        erro: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('processarMensagemIA - Erro registrado no Firestore');
    } catch (logError) {
      console.error('processarMensagemIA - Erro ao registrar erro:', logError);
    }
    
    // Retornar uma resposta padrão em caso de erro
    return 'Estamos enfrentando problemas técnicos no momento. Por favor, tente novamente mais tarde ou entre em contato diretamente pelo telefone (66) 3333-4444.';
  }
}

module.exports = {
  processarMensagemIA,
  getApiKey,
  chamarOpenAI
};

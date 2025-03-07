/**
 * Serviço para integração com OpenAI
 * Responsável por processar mensagens e gerar respostas usando o modelo GPT-3.5-turbo
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Verificar se o Firebase já foi inicializado
try {
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log('Firebase inicializado no openaiService.js');
  } else {
    console.log('Firebase já inicializado anteriormente em openaiService.js');
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase em openaiService.js:', error);
}

// Configurações
const OPENAI_MODEL = 'gpt-3.5-turbo';
const MAX_TOKENS = 250;
const TEMPERATURE = 0.7;
const MAX_CONTEXT_MESSAGES = 8; // Número máximo de mensagens para manter no contexto
// Chave da API fixa para garantir funcionamento
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

// Obter a chave da API das variáveis de ambiente ou configuração do Firebase
const getApiKey = () => {
  // Primeiro tenta obter da variável de ambiente
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) return envKey;
  
  // Depois tenta obter da configuração do Firebase
  try {
    const firebaseKey = functions.config().openai?.apikey;
    if (firebaseKey) return firebaseKey;
  } catch (error) {
    console.log('Erro ao obter chave da configuração do Firebase:', error.message);
  }
  
  // Por fim, usa a chave fixa como fallback
  console.log('Usando chave da API fixa como fallback');
  return OPENAI_API_KEY;
};

/**
 * Chama a API da OpenAI para obter uma resposta
 * @param {Array} mensagens - Array de mensagens para enviar à API
 * @returns {Promise<string>} - Resposta da IA
 */
async function chamarOpenAI(mensagens) {
  try {
    console.log('chamarOpenAI - Iniciando chamada à API');
    console.log('chamarOpenAI - Número de mensagens:', mensagens.length);
    
    // Obter a chave da API
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('chamarOpenAI - Chave da API não encontrada');
      throw new Error('Chave da API não encontrada');
    }
    console.log('chamarOpenAI - Chave da API obtida com sucesso');
    
    // Configurações da chamada
    console.log('chamarOpenAI - Configurando chamada à API');
    console.log('chamarOpenAI - Modelo:', OPENAI_MODEL);
    console.log('chamarOpenAI - Max tokens:', MAX_TOKENS);
    console.log('chamarOpenAI - Temperatura:', TEMPERATURE);
    
    // Fazer a chamada à API
    console.log('chamarOpenAI - Enviando requisição para a API');
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
        }
      }
    );
    
    console.log('chamarOpenAI - Resposta recebida da API');
    console.log('chamarOpenAI - Status da resposta:', response.status);
    
    // Extrair e retornar a resposta
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message && 
        response.data.choices[0].message.content) {
      
      const conteudoResposta = response.data.choices[0].message.content;
      console.log('chamarOpenAI - Conteúdo da resposta:', conteudoResposta.substring(0, 100) + (conteudoResposta.length > 100 ? '...' : ''));
      return conteudoResposta;
    } else {
      console.error('chamarOpenAI - Estrutura de resposta inválida:', JSON.stringify(response.data));
      throw new Error('Resposta da API em formato inválido');
    }
  } catch (error) {
    console.error('chamarOpenAI - Erro ao chamar a API:', error.message);
    
    if (error.response) {
      console.error('chamarOpenAI - Status do erro:', error.response.status);
      console.error('chamarOpenAI - Dados do erro:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('chamarOpenAI - Sem resposta do servidor');
    }
    
    throw error;
  }
}

/**
 * Registra o uso da API para monitoramento de custos
 * @param {number} caracteresPergunta - Número de caracteres na entrada
 * @param {number} caracteresResposta - Número de caracteres na saída
 */
async function registrarUsoAPI(caracteresPergunta, caracteresResposta) {
  try {
    const custoEstimado = (caracteresPergunta / 1000 * 0.005) + (caracteresResposta / 1000 * 0.015);
    
    await admin.firestore().collection('metricas_ia').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      caracteres_entrada: caracteresPergunta,
      caracteres_saida: caracteresResposta,
      modelo: OPENAI_MODEL,
      custo_estimado_usd: custoEstimado
    });
    
    // Verificar limite diário
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const metricas = await admin.firestore().collection('metricas_ia')
      .where('timestamp', '>=', hoje)
      .get();
    
    let custoTotal = 0;
    metricas.forEach(doc => {
      custoTotal += doc.data().custo_estimado_usd || 0;
    });
    
    // Alerta se ultrapassar limite diário (ex: $5)
    if (custoTotal > 5) {
      console.warn(`Alerta: Custo diário da API OpenAI ultrapassou $5 (atual: $${custoTotal.toFixed(2)})`);
    }
  } catch (error) {
    console.error('Erro ao registrar uso da API:', error);
  }
}

/**
 * Cria o prompt para a IA com base nas informações do cliente e histórico
 * @param {Object} cliente - Informações do cliente
 * @param {string} mensagem - Mensagem atual do cliente
 * @param {Array} historicoConversa - Histórico de mensagens anteriores
 * @returns {Array} - Array de mensagens formatado para a OpenAI
 */
function criarPromptParaIA(cliente, mensagem, historicoConversa = []) {
  // Instruções para o sistema - contexto geral
  const sistemaMsg = {
    role: "system",
    content: `Você é um assistente virtual da Ótica Davi. 
    Você deve ser cordial, profissional e fornecer informações precisas sobre agendamentos, produtos e serviços.
    
    Informações do cliente: 
    - Nome: ${cliente.nome || 'Cliente'}
    - Telefone: ${cliente.telefone || 'Não informado'}
    - Cidade: ${cliente.cidade || 'Não informada'}
    
    Agendamentos ativos: ${cliente.agendamentos && cliente.agendamentos.length > 0 
      ? cliente.agendamentos.map(a => `Data: ${a.data}, Horário: ${a.horario}, Cidade: ${a.cidade}`).join('; ') 
      : 'Nenhum agendamento ativo'}
    
    Serviços oferecidos:
    - Exames de vista
    - Venda de óculos de grau e de sol
    - Lentes de contato
    - Ajustes e consertos
    
    Horário de funcionamento:
    - Segunda a sexta: 9h às 18h
    - Sábado: 9h às 13h
    
    Mantenha respostas concisas e objetivas, limitadas a 2-3 frases quando possível.
    Sempre que o cliente perguntar sobre agendamentos, ofereça o link para agendar: https://agendamento.oticadavi.com.br`
  };
  
  // Histórico de mensagens recentes (limitado para manter o contexto enxuto)
  const historicoLimitado = historicoConversa.slice(-MAX_CONTEXT_MESSAGES);
  
  // Mensagem atual do usuário
  const userMsg = {
    role: "user",
    content: mensagem
  };
  
  // Montagem final do prompt
  return [sistemaMsg, ...historicoLimitado, userMsg];
}

/**
 * Processa uma mensagem do cliente e gera uma resposta usando IA
 * @param {string} mensagem - Mensagem enviada pelo cliente
 * @param {string} telefone - Número de telefone do cliente
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
async function processarMensagemIA(mensagem, telefone) {
  try {
    // Buscar informações do cliente e histórico
    const cliente = await buscarInformacoesCliente(telefone);
    const historicoConversa = await buscarHistoricoConversa(telefone);
    
    // Criar prompt para a IA
    const mensagensParaIA = criarPromptParaIA(cliente, mensagem, historicoConversa);
    
    // Chamar a OpenAI
    const resposta = await chamarOpenAI(mensagensParaIA);
    
    // Salvar a conversa
    await salvarConversa(telefone, mensagem, resposta);
    
    return resposta;
  } catch (error) {
    console.error('Erro ao processar mensagem com IA:', error);
    
    // Enviar mensagem de erro amigável
    return "Estamos enfrentando problemas técnicos no momento. Por favor, tente novamente em alguns minutos ou entre em contato pelo telefone (66) 3333-4444.";
  }
}

/**
 * Busca informações do cliente com base no telefone
 * @param {string} telefone - Número de telefone do cliente
 * @returns {Promise<Object>} - Informações do cliente
 */
async function buscarInformacoesCliente(telefone) {
  try {
    // Buscar cliente pelo telefone
    const clientesRef = admin.firestore().collection('agendamentos');
    const snapshot = await clientesRef
      .where('telefone', '==', telefone)
      .orderBy('data_criacao', 'desc')
      .limit(5)
      .get();
    
    if (snapshot.empty) {
      return { telefone };
    }
    
    // Extrair informações do cliente do agendamento mais recente
    const agendamentoRecente = snapshot.docs[0].data();
    
    // Buscar todos os agendamentos ativos
    const agendamentosAtivos = [];
    snapshot.forEach(doc => {
      const agendamento = doc.data();
      // Verificar se o agendamento é futuro
      const dataAgendamento = new Date(agendamento.data);
      const hoje = new Date();
      if (dataAgendamento >= hoje) {
        agendamentosAtivos.push({
          id: doc.id,
          data: agendamento.data,
          horario: agendamento.horario,
          cidade: agendamento.cidade,
          status_confirmacao: agendamento.status_confirmacao || 'pendente'
        });
      }
    });
    
    return {
      nome: agendamentoRecente.nome,
      telefone: telefone,
      cidade: agendamentoRecente.cidade,
      agendamentos: agendamentosAtivos
    };
  } catch (error) {
    console.error('Erro ao buscar informações do cliente:', error);
    return { telefone };
  }
}

/**
 * Busca o histórico de conversa do cliente
 * @param {string} telefone - Número de telefone do cliente
 * @returns {Promise<Array>} - Histórico de conversa
 */
async function buscarHistoricoConversa(telefone) {
  try {
    const db = admin.firestore();
    const conversaRef = db.collection('conversas_ia').doc(telefone);
    const conversaDoc = await conversaRef.get();
    
    if (conversaDoc.exists) {
      const conversaData = conversaDoc.data();
      return conversaData.mensagens || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar histórico de conversa:', error);
    return [];
  }
}

/**
 * Salva a conversa no histórico do cliente
 * @param {string} telefone - Número de telefone do cliente
 * @param {string} mensagem - Mensagem do cliente
 * @param {string} resposta - Resposta da IA
 */
async function salvarConversa(telefone, mensagem, resposta) {
  try {
    const db = admin.firestore();
    const conversaRef = db.collection('conversas_ia').doc(telefone);
    
    const novaMensagemUsuario = { role: "user", content: mensagem, timestamp: admin.firestore.FieldValue.serverTimestamp() };
    const novaMensagemAssistente = { role: "assistant", content: resposta, timestamp: admin.firestore.FieldValue.serverTimestamp() };
    
    await conversaRef.set({
      telefone,
      mensagens: admin.firestore.FieldValue.arrayUnion(novaMensagemUsuario, novaMensagemAssistente),
      ultima_interacao: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
  }
}

module.exports = {
  processarMensagemIA,
  getApiKey,
  chamarOpenAI
};

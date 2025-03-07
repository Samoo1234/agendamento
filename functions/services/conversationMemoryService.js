const admin = require('firebase-admin');

// Inicializa o Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function salvarMemoriaConversa(numeroTelefone, mensagem, resposta, cidade = null) {
  try {
    const conversaRef = db.collection('conversas').doc(numeroTelefone);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // Adiciona a nova interação com a cidade
    await conversaRef.collection('interacoes').add({
      mensagem,
      resposta,
      cidade,
      timestamp
    });

    console.log('💾 Conversa salva com sucesso:', { numeroTelefone, mensagem, resposta, cidade });
  } catch (erro) {
    console.error('❌ Erro ao salvar conversa:', erro);
  }
}

async function buscarHistoricoConversa(numeroTelefone) {
  try {
    const conversaRef = db.collection('conversas').doc(numeroTelefone);
    const interacoesSnapshot = await conversaRef.collection('interacoes')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const historico = [];
    interacoesSnapshot.forEach(doc => {
      const dados = doc.data();
      historico.push({
        mensagem: dados.mensagem,
        resposta: dados.resposta,
        cidade: dados.cidade,
        timestamp: dados.timestamp
      });
    });

    console.log(`📚 Histórico recuperado para ${numeroTelefone}:`, historico.length, 'interações');
    return historico.reverse(); // Retorna na ordem cronológica
  } catch (erro) {
    console.error('❌ Erro ao buscar histórico:', erro);
    return [];
  }
}

async function verificarAgendamentosDisponiveis(cidade, dataInicial) {
  try {
    console.log('🔍 Verificando agendamentos para cidade:', cidade);
    
    const agendamentosRef = db.collection('agendamentos');
    const snapshot = await agendamentosRef
      .where('cidade', '==', cidade)
      .where('status', '==', 'Disponível')
      .where('data', '>=', dataInicial || new Date())
      .orderBy('data')
      .limit(5)
      .get();

    const datasDisponiveis = [];
    snapshot.forEach(doc => {
      const dados = doc.data();
      datasDisponiveis.push({
        data: dados.data,
        horario: dados.horario,
        medico: dados.medicoNome
      });
    });

    console.log(`📅 Encontrados ${datasDisponiveis.length} agendamentos disponíveis para ${cidade}`);
    return datasDisponiveis;
  } catch (erro) {
    console.error('❌ Erro ao verificar agendamentos:', erro);
    return [];
  }
}

module.exports = {
  salvarMemoriaConversa,
  buscarHistoricoConversa,
  verificarAgendamentosDisponiveis
}; 
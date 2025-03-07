const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase
try {
  admin.initializeApp();
  console.log('Firebase inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
  process.exit(1);
}

// Função para buscar os logs mais recentes
async function buscarLogs() {
  try {
    console.log('Buscando logs mais recentes...');
    
    // Buscar logs de erro
    const errosRef = admin.firestore().collection('erros_ia');
    const errosSnapshot = await errosRef.orderBy('timestamp', 'desc').limit(5).get();
    
    console.log('\n===== LOGS DE ERRO =====');
    if (errosSnapshot.empty) {
      console.log('Nenhum log de erro encontrado');
    } else {
      errosSnapshot.forEach(doc => {
        const erro = doc.data();
        console.log(`\nData: ${erro.timestamp ? new Date(erro.timestamp.toDate()).toISOString() : 'N/A'}`);
        console.log(`Telefone: ${erro.telefone}`);
        console.log(`Mensagem: ${erro.mensagem}`);
        console.log(`Erro: ${erro.erro}`);
        console.log(`Stack: ${erro.stack}`);
      });
    }
    
    // Buscar conversas recentes
    const conversasRef = admin.firestore().collection('conversas_ia');
    const conversasSnapshot = await conversasRef.orderBy('ultima_interacao', 'desc').limit(5).get();
    
    console.log('\n===== CONVERSAS RECENTES =====');
    if (conversasSnapshot.empty) {
      console.log('Nenhuma conversa recente encontrada');
    } else {
      conversasSnapshot.forEach(doc => {
        const conversa = doc.data();
        console.log(`\nTelefone: ${conversa.telefone}`);
        console.log(`Última interação: ${conversa.ultima_interacao ? new Date(conversa.ultima_interacao.toDate()).toISOString() : 'N/A'}`);
        console.log(`Número de mensagens: ${conversa.mensagens ? conversa.mensagens.length : 0}`);
        
        if (conversa.mensagens && conversa.mensagens.length > 0) {
          const ultimasMensagens = conversa.mensagens.slice(-2);
          console.log('\nÚltimas mensagens:');
          ultimasMensagens.forEach(msg => {
            console.log(`[${msg.role}]: ${msg.content}`);
          });
        }
      });
    }
    
    // Salvar logs em um arquivo para referência
    const logData = {
      timestamp: new Date().toISOString(),
      erros: [],
      conversas: []
    };
    
    errosSnapshot.forEach(doc => {
      logData.erros.push(doc.data());
    });
    
    conversasSnapshot.forEach(doc => {
      logData.conversas.push(doc.data());
    });
    
    fs.writeFileSync(
      path.join(__dirname, 'webhook-logs.json'), 
      JSON.stringify(logData, null, 2)
    );
    
    console.log('\nLogs salvos em webhook-logs.json');
    
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
  } finally {
    process.exit(0);
  }
}

// Executar
buscarLogs();

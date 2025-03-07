/**
 * Script para monitorar erros da IA registrados no Firestore
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Função para listar erros recentes
async function listarErrosRecentes() {
  try {
    console.log('\n=== MONITORAMENTO DE ERROS DA IA ===');
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    
    // Buscar erros das últimas 24 horas
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    
    const errosRef = admin.firestore().collection('erros_ia');
    const snapshot = await errosRef
      .where('timestamp', '>', ontem)
      .orderBy('timestamp', 'desc')
      .get();
    
    if (snapshot.empty) {
      console.log('\n✅ Nenhum erro registrado nas últimas 24 horas.');
      return;
    }
    
    console.log(`\nEncontrados ${snapshot.size} erros nas últimas 24 horas:`);
    
    snapshot.forEach((doc) => {
      const erro = doc.data();
      console.log('\n-----------------------------------');
      console.log(`ID: ${doc.id}`);
      console.log(`Telefone: ${erro.telefone}`);
      console.log(`Timestamp: ${erro.timestamp.toDate().toLocaleString()}`);
      console.log(`Mensagem do usuário: "${erro.mensagem}"`);
      console.log(`Erro: ${erro.erro}`);
      if (erro.stack) {
        console.log(`Stack: ${erro.stack.split('\n')[0]}`);
      }
    });
    
    console.log('\n-----------------------------------');
    console.log('\nRecomendações:');
    console.log('1. Verifique a chave da API da OpenAI');
    console.log('2. Verifique se o modelo está disponível e funcionando');
    console.log('3. Verifique se há limites de requisições sendo atingidos');
    console.log('4. Verifique a conexão com a internet do servidor');
    
  } catch (error) {
    console.error('Erro ao listar erros:', error);
  }
}

// Função para limpar erros antigos (opcional)
async function limparErrosAntigos() {
  try {
    // Limpar erros com mais de 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const errosRef = admin.firestore().collection('erros_ia');
    const snapshot = await errosRef
      .where('timestamp', '<', seteDiasAtras)
      .get();
    
    if (snapshot.empty) {
      console.log('\nNenhum erro antigo para limpar.');
      return;
    }
    
    console.log(`\nLimpando ${snapshot.size} erros antigos...`);
    
    const batch = admin.firestore().batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Limpeza concluída com sucesso.');
    
  } catch (error) {
    console.error('Erro ao limpar erros antigos:', error);
  }
}

// Executar as funções
async function main() {
  await listarErrosRecentes();
  
  // Descomente a linha abaixo se quiser limpar erros antigos
  // await limparErrosAntigos();
  
  // Encerrar o script
  process.exit(0);
}

main();

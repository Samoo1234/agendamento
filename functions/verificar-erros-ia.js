/**
 * Script para verificar erros registrados no Firestore relacionados à IA
 * Isso ajudará a diagnosticar problemas com o agente de IA
 */
const admin = require('firebase-admin');

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Função para verificar erros da IA
async function verificarErrosIA() {
  try {
    console.log('\n=== VERIFICAÇÃO DE ERROS DA IA ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    
    // Buscar erros registrados
    console.log('\n1. Verificando erros registrados na coleção "erros_ia"');
    const errosSnapshot = await admin.firestore().collection('erros_ia')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    if (errosSnapshot.empty) {
      console.log('Nenhum erro registrado encontrado.');
    } else {
      console.log(`Encontrados ${errosSnapshot.size} registros de erro:`);
      
      errosSnapshot.forEach((doc, index) => {
        const erro = doc.data();
        console.log(`\n--- ERRO ${index + 1} ---`);
        console.log(`Telefone: ${erro.telefone}`);
        console.log(`Mensagem: "${erro.mensagem}"`);
        console.log(`Erro: ${erro.erro}`);
        console.log(`Data: ${erro.timestamp ? erro.timestamp.toDate().toLocaleString('pt-BR') : 'N/A'}`);
        if (erro.stack) {
          console.log(`Stack: ${erro.stack.split('\n')[0]}`);
        }
      });
    }
    
    // Verificar configurações da OpenAI
    console.log('\n2. Verificando configurações da OpenAI');
    const configSnapshot = await admin.firestore().collection('configuracoes').doc('openai').get();
    
    if (!configSnapshot.exists) {
      console.log('Configurações da OpenAI não encontradas no Firestore.');
    } else {
      const config = configSnapshot.data();
      console.log('Configurações encontradas:');
      console.log(`Modelo: ${config.modelo || 'Não definido'}`);
      console.log(`API Key configurada: ${config.apikey ? 'Sim (ocultada por segurança)' : 'Não'}`);
      console.log(`Última atualização: ${config.ultima_atualizacao ? config.ultima_atualizacao.toDate().toLocaleString('pt-BR') : 'N/A'}`);
    }
    
    // Verificar configurações do Firebase
    console.log('\n3. Verificando configurações do Firebase');
    try {
      const firebaseConfig = await admin.functions().app.options;
      console.log(`Projeto: ${firebaseConfig.projectId}`);
      console.log(`Região: ${firebaseConfig.region || 'us-central1 (padrão)'}`);
    } catch (configError) {
      console.log('Não foi possível obter configurações do Firebase:', configError.message);
    }
    
    // Verificar histórico de conversas
    console.log('\n4. Verificando histórico de conversas');
    const conversasSnapshot = await admin.firestore().collection('conversas_ia')
      .orderBy('ultima_interacao', 'desc')
      .limit(5)
      .get();
    
    if (conversasSnapshot.empty) {
      console.log('Nenhuma conversa registrada encontrada.');
    } else {
      console.log(`Encontradas ${conversasSnapshot.size} conversas recentes:`);
      
      conversasSnapshot.forEach((doc, index) => {
        const conversa = doc.data();
        console.log(`\n--- CONVERSA ${index + 1} ---`);
        console.log(`Telefone: ${conversa.telefone}`);
        console.log(`Última interação: ${conversa.ultima_interacao ? conversa.ultima_interacao.toDate().toLocaleString('pt-BR') : 'N/A'}`);
        console.log(`Número de mensagens: ${conversa.mensagens ? conversa.mensagens.length : 0}`);
        
        if (conversa.mensagens && conversa.mensagens.length > 0) {
          const ultimaMensagem = conversa.mensagens[conversa.mensagens.length - 1];
          console.log(`Última mensagem (${ultimaMensagem.role}): "${ultimaMensagem.content.substring(0, 50)}${ultimaMensagem.content.length > 50 ? '...' : ''}"`);
        }
      });
    }
    
    // Verificar chave da API da OpenAI nas configurações do Firebase
    console.log('\n5. Verificando variáveis de ambiente');
    console.log(`OPENAI_API_KEY definida: ${process.env.OPENAI_API_KEY ? 'Sim (ocultada por segurança)' : 'Não'}`);
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    console.log('Recomendações:');
    console.log('1. Verifique se a chave da API da OpenAI está configurada corretamente');
    console.log('2. Verifique se o modelo especificado está disponível na sua conta da OpenAI');
    console.log('3. Verifique se há erros de permissão ou acesso ao Firestore');
    console.log('4. Verifique se o webhook está configurado corretamente');
    
  } catch (error) {
    console.error('\n❌ ERRO AO VERIFICAR ERROS DA IA');
    console.error('Erro:', error);
  }
}

// Executar a verificação
verificarErrosIA();

/**
 * Script para monitorar o uso da API OpenAI
 * Exibe estatísticas de uso e custos estimados
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar o Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

// Função para calcular o custo estimado
function calcularCustoEstimado(caracteresPergunta, caracteresResposta) {
  // Preços aproximados por 1000 tokens (aproximadamente 4 caracteres por token)
  const precoPorMilTokensEntrada = 0.15 / 1000; // $0.15 por 1000 tokens de entrada
  const precoPorMilTokensSaida = 0.60 / 1000;   // $0.60 por 1000 tokens de saída
  
  const tokensEntrada = caracteresPergunta / 4;
  const tokensSaida = caracteresResposta / 4;
  
  const custoEntrada = (tokensEntrada / 1000) * precoPorMilTokensEntrada;
  const custoSaida = (tokensSaida / 1000) * precoPorMilTokensSaida;
  
  return {
    custoEntrada: custoEntrada,
    custoSaida: custoSaida,
    custoTotal: custoEntrada + custoSaida
  };
}

// Função para formatar o custo
function formatarCusto(custo) {
  return `$${custo.toFixed(5)}`;
}

// Função principal para monitorar o uso
async function monitorarUsoOpenAI() {
  try {
    console.log('\n=== MONITORAMENTO DE USO DA API OPENAI ===\n');
    
    // Buscar registros de uso
    const snapshot = await admin.firestore().collection('openai_usage').orderBy('timestamp', 'desc').limit(100).get();
    
    if (snapshot.empty) {
      console.log('Nenhum registro de uso encontrado.');
      return;
    }
    
    // Estatísticas
    let totalCaracteresPergunta = 0;
    let totalCaracteresResposta = 0;
    let totalChamadas = 0;
    let primeiroUso = null;
    let ultimoUso = null;
    
    // Processar registros
    const registros = [];
    snapshot.forEach(doc => {
      const dados = doc.data();
      totalCaracteresPergunta += dados.caracteres_pergunta || 0;
      totalCaracteresResposta += dados.caracteres_resposta || 0;
      totalChamadas++;
      
      if (!primeiroUso || dados.timestamp.toDate() < primeiroUso) {
        primeiroUso = dados.timestamp.toDate();
      }
      
      if (!ultimoUso || dados.timestamp.toDate() > ultimoUso) {
        ultimoUso = dados.timestamp.toDate();
      }
      
      registros.push({
        id: doc.id,
        timestamp: dados.timestamp.toDate(),
        caracteresPergunta: dados.caracteres_pergunta || 0,
        caracteresResposta: dados.caracteres_resposta || 0,
        telefone: dados.telefone || 'Desconhecido'
      });
    });
    
    // Calcular custos
    const custos = calcularCustoEstimado(totalCaracteresPergunta, totalCaracteresResposta);
    
    // Exibir resumo
    console.log('RESUMO DE USO:');
    console.log('--------------------------------------------------');
    console.log(`Total de chamadas à API: ${totalChamadas}`);
    console.log(`Período: ${primeiroUso ? primeiroUso.toLocaleString() : 'N/A'} até ${ultimoUso ? ultimoUso.toLocaleString() : 'N/A'}`);
    console.log(`Total de caracteres (entrada): ${totalCaracteresPergunta} (aproximadamente ${Math.round(totalCaracteresPergunta/4)} tokens)`);
    console.log(`Total de caracteres (saída): ${totalCaracteresResposta} (aproximadamente ${Math.round(totalCaracteresResposta/4)} tokens)`);
    console.log('--------------------------------------------------');
    console.log('CUSTOS ESTIMADOS:');
    console.log(`Custo de entrada: ${formatarCusto(custos.custoEntrada)}`);
    console.log(`Custo de saída: ${formatarCusto(custos.custoSaida)}`);
    console.log(`Custo total: ${formatarCusto(custos.custoTotal)}`);
    console.log('--------------------------------------------------');
    
    // Exibir últimas 10 chamadas
    console.log('\nÚLTIMAS CHAMADAS:');
    console.log('--------------------------------------------------');
    registros.slice(0, 10).forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.timestamp.toLocaleString()} | Telefone: ${reg.telefone}`);
      console.log(`   Entrada: ${reg.caracteresPergunta} caracteres | Saída: ${reg.caracteresResposta} caracteres`);
      const custoChamada = calcularCustoEstimado(reg.caracteresPergunta, reg.caracteresResposta);
      console.log(`   Custo: ${formatarCusto(custoChamada.custoTotal)}`);
      console.log('--------------------------------------------------');
    });
    
    console.log('\nNota: Os custos são estimados com base nos preços aproximados do modelo GPT-4o mini.');
    console.log('Os valores reais podem variar de acordo com as taxas atuais da OpenAI.');
    
  } catch (error) {
    console.error('Erro ao monitorar uso da OpenAI:', error);
  } finally {
    // Encerrar o app do Firebase
    try {
      await admin.app().delete();
    } catch (e) {
      // Ignorar erros ao encerrar
    }
  }
}

// Executar o monitoramento
monitorarUsoOpenAI();

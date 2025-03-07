const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function criarDatasDisponiveis() {
  try {
    const batch = db.batch();
    const datasRef = db.collection('datas_disponiveis');

    // Cria datas para os próximos 5 dias úteis para cada cidade
    const cidades = ['Mantena', 'Mantenópolis', 'Central de Minas', 'Alto Rio Novo', 'São João de Mantena'];
    const periodos = ['Manhã', 'Tarde'];
    const horarios = {
      'Manhã': '08:00 às 11:30',
      'Tarde': '13:30 às 17:30'
    };

    let dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0); // Reseta o horário para meia-noite
    let datasAdicionadas = 0;

    console.log('🕒 Iniciando criação de datas...');

    while (datasAdicionadas < 5) {
      // Pula finais de semana
      if (dataAtual.getDay() !== 0 && dataAtual.getDay() !== 6) {
        for (const cidade of cidades) {
          for (const periodo of periodos) {
            const docRef = datasRef.doc();
            const dataDoc = {
              cidade: cidade,
              data: admin.firestore.Timestamp.fromDate(dataAtual),
              periodo: periodo,
              horario: horarios[periodo],
              disponivel: true,
              criado_em: admin.firestore.FieldValue.serverTimestamp()
            };
            
            batch.set(docRef, dataDoc);
            console.log(`📅 Criando data para ${cidade} - ${dataAtual.toLocaleDateString('pt-BR')} - ${periodo}`);
          }
        }
        datasAdicionadas++;
      }
      // Avança para o próximo dia
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    await batch.commit();
    console.log('✅ Datas de teste criadas com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao criar datas:', erro);
    throw erro; // Propaga o erro para tratamento adequado
  } finally {
    // Encerra a conexão com o Firestore após concluir
    process.exit(0);
  }
}

// Executa a função
console.log('🔥 Iniciando script de criação de datas...');
criarDatasDisponiveis(); 
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Script para testar o sistema de confirmação de agendamentos
 * 
 * Este script:
 * 1. Adiciona o campo status_confirmacao aos agendamentos existentes
 * 2. Cria agendamentos de teste para o dia seguinte
 * 3. Simula respostas de confirmação/cancelamento
 */
async function main() {
  try {
    // 1. Adicionar status_confirmacao aos agendamentos existentes
    console.log('Atualizando agendamentos existentes...');
    const agendamentosRef = db.collection('agendamentos');
    const snapshot = await agendamentosRef.get();
    
    if (snapshot.empty) {
      console.log('Nenhum agendamento encontrado');
    } else {
      const batch = db.batch();
      let count = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.status_confirmacao) {
          batch.update(doc.ref, { status_confirmacao: 'pendente' });
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        console.log(`${count} agendamentos atualizados com status_confirmacao = 'pendente'`);
      } else {
        console.log('Todos os agendamentos já possuem status_confirmacao');
      }
    }
    
    // 2. Criar agendamentos de teste para o dia seguinte
    console.log('\nCriando agendamentos de teste para amanhã...');
    
    // Calcular a data de amanhã
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const dataAmanha = amanha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Dados de teste
    const agendamentosTeste = [
      {
        nome: 'Cliente Teste 1',
        telefone: '5527999999999', // Substitua pelo seu número para testar
        cidade: 'Mantena',
        data: dataAmanha,
        horario: '09:00',
        descricao: 'Agendamento de teste para confirmação',
        status_confirmacao: 'pendente'
      },
      {
        nome: 'Cliente Teste 2',
        telefone: '5527999999999', // Substitua pelo seu número para testar
        cidade: 'Mantenópolis',
        data: dataAmanha,
        horario: '14:30',
        descricao: 'Agendamento de teste para cancelamento',
        status_confirmacao: 'pendente'
      }
    ];
    
    // Adicionar agendamentos de teste
    for (const agendamento of agendamentosTeste) {
      await agendamentosRef.add(agendamento);
      console.log(`Agendamento de teste criado: ${agendamento.nome} - ${agendamento.data} ${agendamento.horario}`);
    }
    
    console.log('\nTestes concluídos!');
    console.log('\nPróximos passos:');
    console.log('1. Implante as Cloud Functions');
    console.log('2. Configure o webhook no painel do WhatsApp Business');
    console.log('3. Aguarde as notificações de confirmação serem enviadas');
    console.log('4. Teste as respostas de confirmação/cancelamento');
    
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  } finally {
    // Encerrar o app
    process.exit(0);
  }
}

// Executar o script
main();

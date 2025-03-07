import { db } from './src/services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function verificarData() {
  const cidade = 'Central de Minas';
  const data = '2025-03-21';
  
  try {
    // Verificar em datas_disponiveis
    const datasRef = collection(db, 'datas_disponiveis');
    const q1 = query(
      datasRef,
      where('cidade', '==', cidade),
      where('data', '==', data)
    );
    
    const snapshot1 = await getDocs(q1);
    console.log('Status em datas_disponiveis:');
    if (snapshot1.empty) {
      console.log('Data não encontrada em datas_disponiveis');
    } else {
      snapshot1.forEach(doc => {
        console.log(doc.data());
      });
    }
    
    // Verificar em agendamentos
    const agendamentosRef = collection(db, 'agendamentos');
    const q2 = query(
      agendamentosRef,
      where('cidade', '==', cidade),
      where('data', '==', data)
    );
    
    const snapshot2 = await getDocs(q2);
    console.log('\nStatus em agendamentos:');
    if (snapshot2.empty) {
      console.log('Data não encontrada em agendamentos');
    } else {
      snapshot2.forEach(doc => {
        console.log(doc.data());
      });
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

verificarData();

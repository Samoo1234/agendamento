const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDate() {
  try {
    const datasRef = collection(db, 'datas_disponiveis');
    const q = query(
      datasRef,
      where('cidade', '==', 'Central de Minas'),
      where('data', '==', '2025-03-21')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Data não encontrada no sistema');
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Data encontrada:', {
        id: doc.id,
        ...data
      });
    });
  } catch (error) {
    console.error('Erro ao verificar data:', error);
  }
}

checkDate();

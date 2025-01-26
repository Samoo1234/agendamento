import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDClU_3RVT-NcnSV7d50Sucz0hWE_Oy13k",
  authDomain: "oticadavi-113e0.firebaseapp.com",
  projectId: "oticadavi-113e0",
  storageBucket: "oticadavi-113e0.appspot.com",
  messagingSenderId: "258252033306",
  appId: "1:258252033306:web:rede88af7cdb01236c95d670a3"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

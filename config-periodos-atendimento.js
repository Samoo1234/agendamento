const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar o app do Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configurações padrão para todas as cidades
const cidadesConfig = [
  {
    cidade: 'Mantena',
    periodos: [
      { inicio: "09:00", fim: "12:00" },
      { inicio: "14:00", fim: "17:00" }
    ],
    intervalo: 10
  },
  {
    cidade: 'Central de Minas',
    periodos: [
      { inicio: "09:00", fim: "12:00" },
      { inicio: "14:00", fim: "17:00" }
    ],
    intervalo: 10
  },
  {
    cidade: 'Mantenópolis',
    periodos: [
      { inicio: "09:00", fim: "12:00" },
      { inicio: "14:00", fim: "17:00" }
    ],
    intervalo: 10
  },
  {
    cidade: 'Alto Rio Novo',
    periodos: [
      { inicio: "09:00", fim: "12:00" },
      { inicio: "14:00", fim: "17:00" }
    ],
    intervalo: 10
  },
  {
    cidade: 'São João de Mantena',
    periodos: [
      { inicio: "09:00", fim: "12:00" },
      { inicio: "14:00", fim: "17:00" }
    ],
    intervalo: 10
  }
];

// Função para configurar os períodos de atendimento
async function configurarPeriodosAtendimento() {
  try {
    const batch = db.batch();
    
    // Verificar se já existem configurações
    const snapshot = await db.collection('periodos_atendimento').get();
    const configsExistentes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Configurações existentes:', configsExistentes);
    
    // Para cada cidade, criar ou atualizar a configuração
    for (const config of cidadesConfig) {
      const configExistente = configsExistentes.find(c => c.cidade === config.cidade);
      
      if (configExistente) {
        console.log(`Atualizando configuração para ${config.cidade}`);
        const docRef = db.collection('periodos_atendimento').doc(configExistente.id);
        batch.update(docRef, config);
      } else {
        console.log(`Criando nova configuração para ${config.cidade}`);
        const docRef = db.collection('periodos_atendimento').doc();
        batch.set(docRef, {
          ...config,
          criadoEm: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    // Executar o batch
    await batch.commit();
    console.log('Configurações de períodos de atendimento atualizadas com sucesso!');
    
  } catch (error) {
    console.error('Erro ao configurar períodos de atendimento:', error);
  } finally {
    // Encerrar a conexão com o Firebase
    admin.app().delete();
  }
}

// Executar a configuração
configurarPeriodosAtendimento();

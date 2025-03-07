const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fazerBackupDatas() {
  try {
    console.log('📦 Iniciando backup das datas...');
    
    // Busca todas as datas disponíveis
    const datasRef = db.collection('datas_disponiveis');
    const snapshot = await datasRef.get();
    
    const backup = {
      data_backup: new Date().toISOString(),
      datas: []
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      backup.datas.push({
        id: doc.id,
        ...data,
        data: data.data ? data.data.toDate().toISOString() : null,
        criadoEm: data.criadoEm ? data.criadoEm.toDate().toISOString() : null
      });
    });

    // Cria diretório de backup se não existir
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Salva o backup com timestamp no nome
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-datas-${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup concluído! ${backup.datas.length} datas salvas em ${backupPath}`);
    console.log('📋 Resumo do backup:');
    
    // Agrupa datas por cidade para mostrar resumo
    const porCidade = {};
    backup.datas.forEach(data => {
      if (!porCidade[data.cidade]) {
        porCidade[data.cidade] = 0;
      }
      porCidade[data.cidade]++;
    });

    for (const [cidade, quantidade] of Object.entries(porCidade)) {
      console.log(`   ${cidade}: ${quantidade} datas`);
    }

  } catch (erro) {
    console.error('❌ Erro ao fazer backup:', erro);
  } finally {
    process.exit();
  }
}

fazerBackupDatas(); 
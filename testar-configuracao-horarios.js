// Script para testar a configuração de horários
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar o app do Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Função para gerar horários com base nas configurações
const gerarHorarios = (periodoManha, periodoTarde, intervalo) => {
  const horarios = [];
  const intervaloDuracao = intervalo || 10;
  
  // Função auxiliar para converter horário (HH:MM) para minutos
  const converterParaMinutos = (horario) => {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + minutos;
  };
  
  // Função auxiliar para converter minutos para horário (HH:MM)
  const converterParaHorario = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // Gerar horários para o período da manhã (se estiver definido)
  if (periodoManha && periodoManha.inicio && periodoManha.fim) {
    const inicioManha = converterParaMinutos(periodoManha.inicio);
    const fimManha = converterParaMinutos(periodoManha.fim);
    
    for (let minutos = inicioManha; minutos < fimManha; minutos += intervaloDuracao) {
      horarios.push(converterParaHorario(minutos));
    }
  }
  
  // Gerar horários para o período da tarde (se estiver definido)
  if (periodoTarde && periodoTarde.inicio && periodoTarde.fim) {
    const inicioTarde = converterParaMinutos(periodoTarde.inicio);
    const fimTarde = converterParaMinutos(periodoTarde.fim);
    
    for (let minutos = inicioTarde; minutos < fimTarde; minutos += intervaloDuracao) {
      horarios.push(converterParaHorario(minutos));
    }
  }
  
  // Se nenhum período foi definido, usar valores padrão
  if (horarios.length === 0) {
    // Período da manhã padrão (09:00 às 12:00)
    const inicioPadrao = converterParaMinutos('09:00');
    const fimPadrao = converterParaMinutos('12:00');
    
    for (let minutos = inicioPadrao; minutos < fimPadrao; minutos += intervaloDuracao) {
      horarios.push(converterParaHorario(minutos));
    }
    
    // Período da tarde padrão (14:00 às 17:00)
    const inicioPadraoTarde = converterParaMinutos('14:00');
    const fimPadraoTarde = converterParaMinutos('17:00');
    
    for (let minutos = inicioPadraoTarde; minutos < fimPadraoTarde; minutos += intervaloDuracao) {
      horarios.push(converterParaHorario(minutos));
    }
  }
  
  return horarios;
};

// Testar diferentes configurações
async function testarConfiguracoes() {
  try {
    console.log("=== TESTE DE CONFIGURAÇÕES DE HORÁRIOS ===");
    
    // Configuração padrão
    const horariosPadrao = gerarHorarios();
    console.log("Horários Padrão (9h-12h, 14h-17h, intervalo 10min):");
    console.log(horariosPadrao);
    console.log(`Total de horários: ${horariosPadrao.length}`);
    console.log("\n");
    
    // Configuração personalizada 1
    const config1 = {
      periodoManha: { inicio: '08:00', fim: '11:30' },
      periodoTarde: { inicio: '13:30', fim: '18:00' },
      intervalo: 15
    };
    const horarios1 = gerarHorarios(config1.periodoManha, config1.periodoTarde, config1.intervalo);
    console.log("Configuração 1 (8h-11:30h, 13:30h-18h, intervalo 15min):");
    console.log(horarios1);
    console.log(`Total de horários: ${horarios1.length}`);
    console.log("\n");
    
    // Configuração apenas com período da manhã
    const config2 = {
      periodoManha: { inicio: '08:00', fim: '12:00' },
      periodoTarde: null,
      intervalo: 10
    };
    const horarios2 = gerarHorarios(config2.periodoManha, config2.periodoTarde, config2.intervalo);
    console.log("Configuração 2 (Apenas período da manhã 8h-12h, intervalo 10min):");
    console.log(horarios2);
    console.log(`Total de horários: ${horarios2.length}`);
    console.log("\n");
    
    // Configuração apenas com período da tarde
    const config3 = {
      periodoManha: null,
      periodoTarde: { inicio: '13:00', fim: '18:00' },
      intervalo: 20
    };
    const horarios3 = gerarHorarios(config3.periodoManha, config3.periodoTarde, config3.intervalo);
    console.log("Configuração 3 (Apenas período da tarde 13h-18h, intervalo 20min):");
    console.log(horarios3);
    console.log(`Total de horários: ${horarios3.length}`);
    console.log("\n");
    
    // Buscar configurações do Firestore
    console.log("Buscando configurações do Firestore...");
    const snapshot = await db.collection('datas_disponiveis').limit(5).get();
    
    if (snapshot.empty) {
      console.log("Nenhuma data encontrada no Firestore.");
    } else {
      for (const doc of snapshot.docs) {
        const data = doc.data();
        console.log(`\nData: ${data.data}, Cidade: ${data.cidade}`);
        
        // Verificar se tem configuração de períodos
        if (data.periodoManha || data.periodoTarde) {
          console.log("Configuração encontrada:");
          
          if (data.periodoManha) {
            console.log(`Período Manhã: ${data.periodoManha.inicio} - ${data.periodoManha.fim}`);
          } else {
            console.log("Período Manhã: Desativado");
          }
          
          if (data.periodoTarde) {
            console.log(`Período Tarde: ${data.periodoTarde.inicio} - ${data.periodoTarde.fim}`);
          } else {
            console.log("Período Tarde: Desativado");
          }
          
          console.log(`Intervalo: ${data.intervalo || 10} minutos`);
          
          // Gerar horários com esta configuração
          const horarios = gerarHorarios(data.periodoManha, data.periodoTarde, data.intervalo);
          console.log(`Horários gerados (${horarios.length}):`);
          console.log(horarios);
        } else {
          console.log("Sem configuração de períodos.");
        }
      }
    }
    
  } catch (error) {
    console.error("Erro ao testar configurações:", error);
  } finally {
    // Encerrar a conexão com o Firebase
    admin.app().delete();
  }
}

// Executar o teste
testarConfiguracoes();

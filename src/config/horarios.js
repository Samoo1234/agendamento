// Configuração de horários para cada cidade
// Este arquivo pode ser modificado sem alterar o layout do formulário

const configuracoesHorarios = {
  // Configuração padrão (usada quando não há configuração específica para a cidade)
  default: {
    periodosManha: {
      inicio: 9, // 9:00
      fim: 12,   // 12:00
    },
    periodosTarde: {
      inicio: 14, // 14:00
      fim: 17,    // 17:00
    },
    intervalo: 10 // minutos
  },
  
  // Configurações específicas por cidade
  // Você pode adicionar ou modificar conforme necessário
  "Mantena": {
    periodosManha: {
      inicio: 8,  // 8:00
      fim: 12,    // 12:00
    },
    periodosTarde: {
      inicio: 13, // 13:00
      fim: 18,    // 18:00
    },
    intervalo: 10 // minutos
  },
  
  "Central de Minas": {
    periodosManha: {
      inicio: 9,  // 9:00
      fim: 11,    // 11:00
    },
    periodosTarde: {
      inicio: 14, // 14:00
      fim: 17,    // 17:00
    },
    intervalo: 10 // minutos
  },
  
  // Adicione outras cidades conforme necessário
};

// Função para gerar horários com base na configuração
export const gerarHorariosPorCidade = (cidade) => {
  const config = configuracoesHorarios[cidade] || configuracoesHorarios.default;
  const horarios = [];
  
  // Horários da manhã
  for (let hora = config.periodosManha.inicio; hora < config.periodosManha.fim; hora++) {
    for (let minuto = 0; minuto < 60; minuto += config.intervalo) {
      horarios.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }
  }
  
  // Horários da tarde
  for (let hora = config.periodosTarde.inicio; hora < config.periodosTarde.fim; hora++) {
    for (let minuto = 0; minuto < 60; minuto += config.intervalo) {
      horarios.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }
  }
  
  return horarios;
};

// Exportar a configuração padrão para uso em outros lugares
export const getConfigHorarios = (cidade) => {
  return configuracoesHorarios[cidade] || configuracoesHorarios.default;
};

export default configuracoesHorarios;

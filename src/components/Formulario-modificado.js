// Este é um exemplo de como modificar o componente Formulario.js
// para usar as configurações de períodos de atendimento do Firestore

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import SecurityIcon from '@mui/icons-material/Security';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import { db, functions } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const cidades = [
  'Mantena',
  'Central de Minas',
  'Mantenópolis',
  'Alto Rio Novo',
  'São João de Mantena'
];

// Função para gerar horários disponíveis baseada nas configurações do Firestore
const gerarHorarios = (periodos, intervalo = 10) => {
  const horarios = [];
  
  // Para cada período configurado
  periodos.forEach(periodo => {
    const [horaInicio, minutoInicio] = periodo.inicio.split(':').map(Number);
    const [horaFim, minutoFim] = periodo.fim.split(':').map(Number);
    
    // Converter para minutos para facilitar o cálculo
    const inicioEmMinutos = horaInicio * 60 + minutoInicio;
    const fimEmMinutos = horaFim * 60 + minutoFim;
    
    // Gerar horários para este período
    for (let minutoAtual = inicioEmMinutos; minutoAtual < fimEmMinutos; minutoAtual += intervalo) {
      const hora = Math.floor(minutoAtual / 60);
      const minuto = minutoAtual % 60;
      
      horarios.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }
  });
  
  return horarios;
};

// Horários padrão para usar enquanto carrega as configurações
const horariosDefault = [
  // Horários da manhã (09:00 às 12:00)
  ...Array.from({ length: 3 * 6 }, (_, i) => {
    const hora = Math.floor(i / 6) + 9;
    const minuto = (i % 6) * 10;
    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  }),
  // Horários da tarde (14:00 às 17:00)
  ...Array.from({ length: 3 * 6 }, (_, i) => {
    const hora = Math.floor(i / 6) + 14;
    const minuto = (i % 6) * 10;
    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  })
];

function Formulario() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [telefoneError, setTelefoneError] = useState('');
  const [cidade, setCidade] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [medicoNome, setMedicoNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState(horariosDefault);
  const [configPeriodos, setConfigPeriodos] = useState({});
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // Carregar configurações de períodos de atendimento
  useEffect(() => {
    const carregarConfigPeriodos = async () => {
      try {
        const periodosRef = collection(db, 'periodos_atendimento');
        const snapshot = await getDocs(periodosRef);
        
        const configs = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          configs[data.cidade] = {
            periodos: data.periodos || [],
            intervalo: data.intervalo || 10
          };
        });
        
        setConfigPeriodos(configs);
        console.log('Configurações de períodos carregadas:', configs);
      } catch (error) {
        console.error('Erro ao carregar configurações de períodos:', error);
      }
    };
    
    carregarConfigPeriodos();
  }, []);

  useEffect(() => {
    if (cidade) {
      carregarDatasDisponiveis(cidade);
    } else {
      setDatasDisponiveis([]);
    }
  }, [cidade]);

  useEffect(() => {
    if (cidade && data) {
      carregarHorariosDisponiveis(cidade, data);
      carregarMedicoInfo(cidade, data);
    } else {
      // Usar configuração específica da cidade se disponível, ou padrão
      if (cidade && configPeriodos[cidade]) {
        const config = configPeriodos[cidade];
        setHorariosDisponiveis(gerarHorarios(config.periodos, config.intervalo));
      } else {
        setHorariosDisponiveis(horariosDefault);
      }
      setMedicoNome('');
    }
  }, [cidade, data, configPeriodos]);

  const carregarDatasDisponiveis = async (cidadeSelecionada) => {
    try {
      const datasRef = collection(db, 'datas_disponiveis');
      const q = query(
        datasRef, 
        where('cidade', '==', cidadeSelecionada)
      );
      const querySnapshot = await getDocs(q);
      
      const datas = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Data encontrada:', {
          id: doc.id,
          ...data,
          dataFormatada: new Date(data.data + 'T00:00:00').toLocaleDateString('en-CA')
        });
        return {
          id: doc.id,
          ...data
        };
      });
      
      // Obter data de hoje formatada como YYYY-MM-DD
      const hoje = new Date();
      const hojeFormatado = hoje.toLocaleDateString('en-CA');
      
      const datasFuturas = datas.filter(data => {
        const dataDisponivel = new Date(data.data + 'T00:00:00');
        const dataFormatada = dataDisponivel.toLocaleDateString('en-CA');
        const disponivel = dataFormatada >= hojeFormatado && data.status === 'disponível';
        console.log('Verificando data:', {
          data: data.data,
          dataFormatada,
          status: data.status,
          disponivel
        });
        return disponivel;
      }).sort((a, b) => {
        const dataA = new Date(a.data + 'T00:00:00');
        const dataB = new Date(b.data + 'T00:00:00');
        return dataA - dataB;
      });

      console.log('Datas futuras filtradas:', datasFuturas);
      setDatasDisponiveis(datasFuturas);
    } catch (error) {
      console.error('Erro ao carregar datas disponíveis:', error);
      setError('Erro ao carregar datas disponíveis para esta cidade');
    }
  };

  const carregarHorariosDisponiveis = async (cidadeSelecionada, dataSelecionada) => {
    try {
      // Ajusta a data para o fuso horário local
      const dataLocal = new Date(dataSelecionada + 'T00:00:00');
      const dataFormatada = dataLocal.toLocaleDateString('en-CA');

      // Gerar horários baseados na configuração da cidade
      let todosHorarios;
      if (configPeriodos[cidadeSelecionada]) {
        const config = configPeriodos[cidadeSelecionada];
        todosHorarios = gerarHorarios(config.periodos, config.intervalo);
      } else {
        todosHorarios = horariosDefault;
      }

      const agendamentosRef = collection(db, 'agendamentos');
      const q = query(
        agendamentosRef,
        where('cidade', '==', cidadeSelecionada),
        where('data', '==', dataFormatada)
      );
      const querySnapshot = await getDocs(q);
      
      // Pegar horários já agendados
      const horariosOcupados = querySnapshot.docs.map(doc => doc.data().horario);
      
      // Filtrar horários disponíveis
      const horariosLivres = todosHorarios.filter(horario => !horariosOcupados.includes(horario));
      
      setHorariosDisponiveis(horariosLivres);
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      setError('Erro ao carregar horários disponíveis para esta data');
    }
  };

  // Resto do componente permanece igual...
  // Inclua aqui o restante do código do componente Formulario.js
  
  return (
    // Retorne o JSX do componente aqui...
    <div>
      {/* Mantenha o layout original aqui */}
    </div>
  );
}

export default Formulario;

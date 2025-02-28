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

// Função para gerar horários disponíveis com base nas configurações
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

// Gerar horários padrão para uso inicial
const horariosPadrao = gerarHorarios();

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
  const [horariosDisponiveis, setHorariosDisponiveis] = useState(horariosPadrao);
  const [dataConfig, setDataConfig] = useState(null);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

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
      setHorariosDisponiveis(horariosPadrao);
      setMedicoNome('');
    }
  }, [cidade, data]);

  const carregarDatasDisponiveis = async (cidadeSelecionada) => {
    try {
      const datasRef = collection(db, 'datas_disponiveis');
      const q = query(
        datasRef, 
        where('cidade', '==', cidadeSelecionada)  // Removendo temporariamente o filtro de status
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

      // Filtrar apenas datas futuras
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeFormatado = hoje.toLocaleDateString('en-CA');
      console.log('Data de hoje:', hojeFormatado);
      
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

      // Buscar a configuração da data selecionada
      const datasRef = collection(db, 'datas_disponiveis');
      const qConfig = query(
        datasRef,
        where('cidade', '==', cidadeSelecionada),
        where('data', '==', dataFormatada)
      );
      const configSnapshot = await getDocs(qConfig);
      
      let config = null;
      if (!configSnapshot.empty) {
        config = configSnapshot.docs[0].data();
        setDataConfig(config);
      }

      // Gerar horários com base na configuração
      const todosHorarios = config ? 
        gerarHorarios(config.periodoManha, config.periodoTarde, config.intervalo) : 
        horariosPadrao;

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

  const carregarMedicoInfo = async (cidadeSelecionada, dataSelecionada) => {
    try {
      const datasRef = collection(db, 'datas_disponiveis');
      const q = query(
        datasRef,
        where('cidade', '==', cidadeSelecionada),
        where('data', '==', dataSelecionada)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const dataDoc = querySnapshot.docs[0].data();
        setMedicoNome(dataDoc.medicoNome || '');
      } else {
        setMedicoNome('');
      }
    } catch (error) {
      console.error('Erro ao carregar informações do médico:', error);
      setMedicoNome('');
    }
  };

  const formatarTelefone = (valor) => {
    // Remove tudo que não é número
    const numeroLimpo = valor.replace(/\D/g, '');
    
    // Formata para exibição no input
    let numeroFormatado = numeroLimpo;
    if (numeroLimpo.length <= 11) {
      numeroFormatado = numeroLimpo
        .replace(/^(\d{2})/, '($1)')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return numeroFormatado;
  };

  const formatarTelefoneParaWhatsApp = (telefone) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    return `+55${numeroLimpo}`;
  };

  const validarTelefone = (telefone) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length !== 11) {
      setTelefoneError('Telefone deve ter 11 números (DDD + número)');
      return false;
    }
    setTelefoneError('');
    return true;
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setTelefone(valorFormatado);
    // Só valida se houver um número digitado
    if (valorFormatado) {
      if (valorFormatado.length < 14) {
        setTelefoneError('Número de telefone incompleto');
      } else {
        setTelefoneError('');
      }
    } else {
      setTelefoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !cidade || !data || !horario) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    // Só valida o telefone se foi preenchido
    if (telefone && telefone.length < 14) {
      setError('Número de telefone incompleto');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verificar se a data selecionada está disponível
      const dataExiste = datasDisponiveis.some(d => {
        const dataDisp = new Date(d.data + 'T00:00:00');
        const dataSel = new Date(data + 'T00:00:00');
        return dataDisp.toLocaleDateString('en-CA') === dataSel.toLocaleDateString('en-CA');
      });
      
      if (!dataExiste) {
        throw new Error('Data selecionada não está disponível');
      }

      // Verificar se o horário ainda está disponível
      const dataLocal = new Date(data + 'T00:00:00');
      const dataFormatada = dataLocal.toLocaleDateString('en-CA');

      const agendamentosRef = collection(db, 'agendamentos');
      const q = query(
        agendamentosRef,
        where('cidade', '==', cidade),
        where('data', '==', dataFormatada),
        where('horario', '==', horario)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Este horário já foi agendado. Por favor, escolha outro horário.');
      }

      const telefoneWhatsApp = telefone ? formatarTelefoneParaWhatsApp(telefone) : '';

      // Adicionar o agendamento ao Firestore
      const docRef = await addDoc(collection(db, 'agendamentos'), {
        nome: nome.trim(),
        telefone: telefoneWhatsApp,
        cidade,
        data: dataFormatada,
        horario,
        descricao: descricao.trim(),
        criadoEm: Timestamp.now(),
        status: 'pendente'
      });

      console.log('Agendamento criado com ID:', docRef.id);

      // Enviar notificação por WhatsApp se tiver telefone
      if (telefoneWhatsApp) {
        try {
          // Formatar a data para exibição
          const dataFormatadaBR = new Date(dataFormatada).toLocaleDateString('pt-BR');
          
          // Chamar a Cloud Function para enviar a mensagem
          const sendWhatsAppConfirmation = httpsCallable(functions, 'sendWhatsAppConfirmation');
          const resultado = await sendWhatsAppConfirmation({
            telefone: telefoneWhatsApp,
            nome: nome.trim(),
            data: dataFormatadaBR,
            horario: horario,
            cidade: cidade
          });
          
          console.log('Notificação WhatsApp enviada:', resultado.data);
        } catch (whatsappError) {
          // Não interrompe o fluxo se falhar o envio da mensagem
          console.error('Erro ao enviar notificação WhatsApp:', whatsappError);
        }
      }

      setSuccess(true);
      setNome('');
      setTelefone('');
      setCidade('');
      setData('');
      setHorario('');
      setDescricao('');
      
      // Recarregar horários disponíveis após o agendamento
      if (cidade && data) {
        carregarHorariosDisponiveis(cidade, data);
      }
    } catch (error) {
      console.error('Erro ao agendar:', error);
      setError(error.message || 'Erro ao agendar. Por favor, tente novamente.');
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
          <Tooltip title="Área Administrativa">
            <IconButton 
              color="primary" 
              onClick={() => navigate('/login')}
              sx={{ 
                backgroundColor: '#e6e6ff', 
                color: '#000033', 
                '&:hover': {
                  backgroundColor: '#ccccff', 
                  color: '#000066', 
                },
                transition: 'all 0.3s ease' 
              }}
            >
              <SecurityIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4, 
          backgroundColor: '#000033', 
          padding: '20px',
          borderRadius: '8px'
        }}>
          <Box
            component="img"
            src="/logo_new.png"
            alt="Logo"
            sx={{
              maxWidth: { xs: '200px', sm: '250px', md: '300px' },
              width: '100%',
              height: 'auto',
              marginBottom: '0px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </Box>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton
            sx={{ opacity: 0.7 }}
            onClick={colorMode.toggleColorMode}
            color="primary"
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          Agendar Consulta
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* 1. Cidade da consulta */}
          <TextField
            fullWidth
            select
            label="Cidade da consulta"
            value={cidade}
            onChange={(e) => {
              setCidade(e.target.value);
              setData(''); // Limpa a data ao mudar de cidade
            }}
            margin="normal"
            required
          >
            {cidades.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* 2. Data da consulta */}
          <TextField
            fullWidth
            select
            label="Data da Consulta"
            value={data}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value + 'T00:00:00');
              const formattedDate = selectedDate.toLocaleDateString('en-CA');
              setData(formattedDate);
            }}
            margin="normal"
            required
            disabled={!cidade || datasDisponiveis.length === 0}
            helperText={!cidade ? 'Selecione uma cidade primeiro' : 
                       datasDisponiveis.length === 0 ? 'Não há datas disponíveis para esta cidade' : ''}
          >
            {datasDisponiveis.map((dataDisp) => (
              <MenuItem key={dataDisp.id} value={dataDisp.data}>
                {new Date(dataDisp.data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </MenuItem>
            ))}
          </TextField>

          {/* 3. Horário da consulta */}
          <TextField
            select
            fullWidth
            label="Horário"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            disabled={!data}
            required
            margin="normal"
          >
            {horariosDisponiveis.map((hora) => (
              <MenuItem key={hora} value={hora}>
                {hora}
              </MenuItem>
            ))}
          </TextField>

          {medicoNome && (
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                width: '100%',
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              Médico: {medicoNome}
            </Typography>
          )}

          {/* 4. Nome completo */}
          <TextField
            fullWidth
            label="Nome Completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            required
          />

          {/* 5. Telefone */}
          <TextField
            fullWidth
            label="Telefone"
            value={telefone}
            onChange={handleTelefoneChange}
            margin="normal"
            error={!!telefoneError}
            helperText={telefoneError}
            sx={{ mb: 2 }}
            placeholder="(00) 00000-0000"
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Informações adicionais"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            margin="normal"
            placeholder="Descreva o motivo da consulta"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Agendar'}
          </Button>
        </form>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Agendamento realizado com sucesso!
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Formulario;

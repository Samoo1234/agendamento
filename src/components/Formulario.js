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
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

const cidades = [
  'Mantena',
  'Central de Minas',
  'Mantenópolis',
  'Alto Rio Novo',
  'São João de Mantena'
];

// Função para gerar horários disponíveis
const gerarHorarios = () => {
  const horarios = [];
  
  // Horários da manhã (09:00 às 12:00)
  for (let hora = 9; hora < 12; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 10) {
      horarios.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }
  }
  
  // Horários da tarde (14:00 às 17:00)
  for (let hora = 14; hora < 17; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 10) {
      horarios.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }
  }
  
  return horarios;
};

const horarios = gerarHorarios();

function Formulario() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataNascimentoError, setDataNascimentoError] = useState('');
  const [telefone, setTelefone] = useState('');
  const [telefoneError, setTelefoneError] = useState('');
  const [cidade, setCidade] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState(horarios);
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
    } else {
      setHorariosDisponiveis(horarios);
    }
  }, [cidade, data]);

  const carregarDatasDisponiveis = async (cidadeSelecionada) => {
    try {
      const datasRef = collection(db, 'datas_disponiveis');
      const q = query(
        datasRef, 
        where('cidade', '==', cidadeSelecionada),
        where('status', '==', 'disponível')
      );
      const querySnapshot = await getDocs(q);
      
      const datas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrar apenas datas futuras
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeFormatado = hoje.toLocaleDateString('en-CA');
      
      const datasFuturas = datas.filter(data => {
        const dataDisponivel = new Date(data.data + 'T00:00:00');
        const dataFormatada = dataDisponivel.toLocaleDateString('en-CA');
        return dataFormatada >= hojeFormatado;
      }).sort((a, b) => {
        const dataA = new Date(a.data + 'T00:00:00');
        const dataB = new Date(b.data + 'T00:00:00');
        return dataA - dataB;
      });

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
      const horariosLivres = horarios.filter(horario => !horariosOcupados.includes(horario));
      
      setHorariosDisponiveis(horariosLivres);
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
      setError('Erro ao carregar horários disponíveis para esta data');
    }
  };

  const formatarTelefone = (valor) => {
    // Remove tudo que não é número
    const numeroLimpo = valor.replace(/\D/g, '');
    
    // Aplica a máscara
    let numeroFormatado = numeroLimpo;
    if (numeroLimpo.length <= 11) {
      numeroFormatado = numeroLimpo
        .replace(/^(\d{2})/, '($1)')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return numeroFormatado;
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
    validarTelefone(valorFormatado);
  };

  const validarDataNascimento = (data) => {
    if (!data) return false;

    const dataNasc = new Date(data);
    const hoje = new Date();
    const anoMinimo = 1900;
    
    // Verifica se é uma data válida
    if (isNaN(dataNasc.getTime())) {
      setDataNascimentoError('Data inválida');
      return false;
    }

    // Verifica se a data é futura
    if (dataNasc > hoje) {
      setDataNascimentoError('A data não pode ser futura');
      return false;
    }

    // Verifica se o ano é menor que 1900
    if (dataNasc.getFullYear() < anoMinimo) {
      setDataNascimentoError('O ano não pode ser menor que 1900');
      return false;
    }

    // Verifica se o ano tem mais de 4 dígitos
    if (data.split('-')[0].length > 4) {
      setDataNascimentoError('O ano deve ter 4 dígitos');
      return false;
    }

    setDataNascimentoError('');
    return true;
  };

  const handleDataNascimentoChange = (e) => {
    const novaData = e.target.value;
    setDataNascimento(novaData);
    validarDataNascimento(novaData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação da data de nascimento antes de enviar
    if (!validarDataNascimento(dataNascimento)) {
      return;
    }

    // Validação do telefone antes de enviar
    if (!validarTelefone(telefone)) {
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

      await addDoc(collection(db, 'agendamentos'), {
        nome,
        dataNascimento,
        telefone,
        cidade,
        data: dataFormatada,
        horario,
        descricao,
        criadoEm: Timestamp.now(),
        status: 'pendente'
      });

      setSuccess(true);
      setNome('');
      setDataNascimento('');
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
          <TextField
            fullWidth
            label="Nome Completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Data de Nascimento"
            type="date"
            value={dataNascimento}
            onChange={handleDataNascimentoChange}
            margin="normal"
            required
            error={!!dataNascimentoError}
            helperText={dataNascimentoError}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: new Date().toISOString().split('T')[0], // Data máxima é hoje
              min: "1900-01-01" // Data mínima é 01/01/1900
            }}
          />

          <TextField
            fullWidth
            label="Telefone"
            value={telefone}
            onChange={handleTelefoneChange}
            margin="normal"
            required
            placeholder="(00)00000-0000"
            error={!!telefoneError}
            helperText={telefoneError}
            inputProps={{
              maxLength: 14
            }}
          />

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

          <TextField
            select
            fullWidth
            label="Horário"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            disabled={!data}
            required
            sx={{ mb: 2 }}
          >
            {horariosDisponiveis.map((hora) => (
              <MenuItem key={hora} value={hora}>
                {hora}
              </MenuItem>
            ))}
          </TextField>

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

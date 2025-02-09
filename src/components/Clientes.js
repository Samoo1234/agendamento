import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../App';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const cidades = [
  'Mantena',
  'Mantenópolis',
  'Central de Minas',
  'Alto Rio Novo',
  'São João de Mantena'
];

function Clientes() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [clientes, setClientes] = useState([]);
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);

  useEffect(() => {
    carregarClientes();
  }, [filtroCidade, filtroPeriodo]);

  useEffect(() => {
    if (filtroCidade) {
      carregarDatasDisponiveis();
    } else {
      setDatasDisponiveis([]);
      setFiltroPeriodo('');
    }
  }, [filtroCidade]);

  const carregarClientes = async () => {
    try {
      const clientesRef = collection(db, 'agendamentos');
      const snapshot = await getDocs(clientesRef);
      const clientesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataNascimento: data.dataNascimento?.toDate?.() || new Date(data.dataNascimento + 'T00:00:00'),
          data: data.data || '',
          cidade: data.cidade || '',
          horario: data.horario || '',
          status: data.status || 'Pendente',
          descricao: data.descricao || ''
        };
      });

      // Filtrar por cidade se necessário
      let clientesFiltrados = clientesData;
      if (filtroCidade) {
        clientesFiltrados = clientesData.filter(cliente => 
          cliente.cidade === filtroCidade
        );
      }

      setClientes(clientesFiltrados);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
      setLoading(false);
    }
  };

  const carregarDatasDisponiveis = async () => {
    try {
      const datasRef = collection(db, 'datas_disponiveis');
      const q = query(
        datasRef,
        where('cidade', '==', filtroCidade),
        where('status', '==', 'disponível')
      );
      const querySnapshot = await getDocs(q);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeFormatado = hoje.toLocaleDateString('en-CA');

      const datas = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(data => {
          const dataDisponivel = new Date(data.data + 'T00:00:00');
          const dataFormatada = dataDisponivel.toLocaleDateString('en-CA');
          return dataFormatada >= hojeFormatado;
        })
        .sort((a, b) => {
          const dataA = new Date(a.data + 'T00:00:00');
          const dataB = new Date(b.data + 'T00:00:00');
          return dataA - dataB;
        });

      setDatasDisponiveis(datas);
      // Limpa a data selecionada quando mudar de cidade
      setFiltroPeriodo('');
    } catch (error) {
      console.error('Erro ao carregar datas:', error);
      setError('Erro ao carregar datas disponíveis');
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    const dataObj = new Date(data + 'T00:00:00');
    return dataObj.toLocaleDateString('pt-BR');
  };

  const filtrarClientes = () => {
    return clientes.filter(cliente => {
      const passaFiltroCidade = !filtroCidade || cliente.cidade === filtroCidade;
      const passaFiltroPeriodo = !filtroPeriodo || cliente.data === filtroPeriodo;
      return passaFiltroCidade && passaFiltroPeriodo;
    });
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    
    // Adiciona título centralizado
    doc.setFontSize(16);
    doc.text('Agendamentos', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Adiciona data do relatório
    doc.setFontSize(10);
    doc.text(
      `Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`,
      doc.internal.pageSize.width / 2,
      30,
      { align: 'center' }
    );

    const clientesFiltrados = filtrarClientes();
    const dados = clientesFiltrados.map(cliente => [
      cliente.nome || '',
      cliente.cidade || '',
      formatarData(cliente.data) || '',
      cliente.horario || '',
      cliente.descricao || ''
    ]);

    doc.autoTable({
      head: [['Nome', 'Cidade', 'Data', 'Horário', 'Descrição']],
      body: dados,
      startY: 40,
      theme: theme.palette.mode === 'dark' ? 'dark' : 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: theme.palette.mode === 'dark' ? [50, 50, 50] : [220, 220, 220],
        textColor: theme.palette.mode === 'dark' ? [255, 255, 255] : [0, 0, 0]
      }
    });

    doc.save('relatorio-clientes.pdf');
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (newDate) {
      setFiltroPeriodo(dayjs(newDate).format('YYYY-MM-DD'));
    } else {
      setFiltroPeriodo('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3
        }}>
          <TextField
            select
            label="Cidade"
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: '200px' },
              flex: { sm: 1 }
            }}
          >
            <MenuItem value="">Todas as cidades</MenuItem>
            {cidades.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Data"
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            disabled={!filtroCidade}
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: '200px' },
              flex: { sm: 1 }
            }}
            helperText={!filtroCidade ? "Selecione uma cidade primeiro" : 
                       datasDisponiveis.length === 0 ? "Não há datas disponíveis para esta cidade" : ""}
          >
            <MenuItem value="">Todas as datas</MenuItem>
            {datasDisponiveis.map((data) => (
              <MenuItem key={data.id} value={data.data}>
                {new Date(data.data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TableContainer 
          component={Paper}
          sx={{
            overflowX: 'auto',
            '& .MuiTableCell-root': {
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 2 },
              fontSize: { xs: '0.8rem', sm: '1rem' }
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#000033' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cidade</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Horário</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrarClientes().map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome || ''}</TableCell>
                  <TableCell>{cliente.cidade || ''}</TableCell>
                  <TableCell>{formatarData(cliente.data)}</TableCell>
                  <TableCell>{cliente.horario || ''}</TableCell>
                  <TableCell>{cliente.descricao || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={gerarPDF}
          disabled={loading}
          fullWidth={isMobile}
        >
          Gerar PDF
        </Button>
      </Box>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Clientes;

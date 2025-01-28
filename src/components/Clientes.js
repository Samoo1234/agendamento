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
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

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

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesNascimento > mesAtual || 
        (mesNascimento === mesAtual && nascimento.getDate() > hoje.getDate())) {
      idade--;
    }
    return idade;
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
      calcularIdade(cliente.dataNascimento) || '',
      cliente.cidade || '',
      formatarData(cliente.data) || '',
      cliente.horario || '',
      cliente.descricao || ''
    ]);

    doc.autoTable({
      head: [['Nome', 'Idade', 'Cidade', 'Data', 'Horário', 'Descrição']],
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
        gap: 2,
        '& .MuiTextField-root': {
          minWidth: { xs: '100%', sm: 200 },
          maxWidth: { xs: '100%', sm: 300 }
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <TextField
            select
            label="Cidade"
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            variant="outlined"
            size="small"
            required
          >
            <MenuItem value="">Todas</MenuItem>
            {cidades.map((cidade) => (
              <MenuItem key={cidade} value={cidade}>
                {cidade}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label="Data"
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Idade</TableCell>
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
                  <TableCell>{calcularIdade(cliente.dataNascimento)}</TableCell>
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

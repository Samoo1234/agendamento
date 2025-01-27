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
          dataNascimento: data.dataNascimento?.toDate?.() || new Date(data.dataNascimento),
          data: data.data || '',
          cidade: data.cidade || '',
          horario: data.horario || '',
          status: data.status || 'Pendente'
        };
      });
      setClientes(clientesData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
      setLoading(false);
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '';
    try {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      
      return idade;
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return '';
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
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
    doc.text('Relatório de Clientes', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
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
      cliente.status || ''
    ]);

    doc.autoTable({
      head: [['Nome', 'Idade', 'Cidade', 'Data', 'Horário', 'Status']],
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 4,
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Clientes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            sx={{ opacity: 0.7 }}
            onClick={colorMode.toggleColorMode}
            color="primary"
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
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
      </Box>

      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          mb: 3 
        }}>
          <TextField
            select
            label="Cidade"
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            fullWidth
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
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Idade</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Data</TableCell>
                <TableCell>Horário</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrarClientes().map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome || ''}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {calcularIdade(cliente.dataNascimento)}
                  </TableCell>
                  <TableCell>{cliente.cidade || ''}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {formatarData(cliente.data)}
                  </TableCell>
                  <TableCell>{cliente.horario || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
    </Box>
  );
}

export default Clientes;

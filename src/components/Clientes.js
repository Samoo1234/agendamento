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
  CircularProgress
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const cidades = [
  'Mantena',
  'Barra de São Francisco',
  'Água Doce do Norte',
  'Ecoporanga',
  'Vila Pavão'
];

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const clientesRef = collection(db, 'agendamentos');
      const snapshot = await getDocs(clientesRef);
      const clientesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
      setLoading(false);
    }
  };

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
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
    
    // Adiciona a logo
    const img = new Image();
    img.src = '/logo new.png';
    
    img.onload = () => {
      // Calcula as dimensões para manter a proporção e não ficar muito grande
      const imgWidth = 30;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      // Adiciona a imagem centralizada no topo
      doc.addImage(img, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
      
      // Adiciona título centralizado abaixo da logo
      doc.setFontSize(16);
      doc.text('Relatório de Clientes', doc.internal.pageSize.width / 2, imgHeight + 20, { align: 'center' });
      
      // Adiciona data do relatório
      doc.setFontSize(10);
      doc.text(
        `Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`,
        doc.internal.pageSize.width / 2,
        imgHeight + 30,
        { align: 'center' }
      );

      const clientesFiltrados = filtrarClientes();
      const dados = clientesFiltrados.map(cliente => [
        cliente.nome,
        calcularIdade(cliente.dataNascimento),
        cliente.cidade,
        cliente.data,
        cliente.horario,
        cliente.status
      ]);

      doc.autoTable({
        head: [['Nome', 'Idade', 'Cidade', 'Data', 'Horário', 'Status']],
        body: dados,
        startY: imgHeight + 40,
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
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
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
          >
            Gerar PDF
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                <TableCell>Idade</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrarClientes().map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{calcularIdade(cliente.dataNascimento)}</TableCell>
                  <TableCell>{cliente.cidade}</TableCell>
                  <TableCell>{cliente.data}</TableCell>
                  <TableCell>{cliente.horario}</TableCell>
                  <TableCell>{cliente.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
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
  );
}

export default Clientes;

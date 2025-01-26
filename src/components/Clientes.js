import React, { useState, useEffect, useContext } from 'react';
import { db } from '../services/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PDFDocument, rgb } from 'pdf-lib';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from '@mui/material/IconButton';

const cidades = [
  'Mantena',
  'Central de Minas',
  'Mantenópolis',
  'Alto Rio Novo',
  'São João de Mantena'
];

function Clientes() {
  const [cidadeSelecionada, setCidadeSelecionada] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clientes, setClientes] = useState([]);
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
      const q = query(clientesRef);
      const querySnapshot = await getDocs(q);
      
      const dados = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        idade: calcularIdade(doc.data().dataNascimento)
      }));
      
      setClientes(dados);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar lista de clientes');
    } finally {
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
      const passaFiltroData = (!dataInicio || cliente.data >= dataInicio) &&
                             (!dataFim || cliente.data <= dataFim);
      const passaFiltroCidade = cidadeSelecionada === 'todos' || cliente.cidade === cidadeSelecionada;
      
      return passaFiltroData && passaFiltroCidade;
    });
  };

  const gerarPDF = async () => {
    try {
      setLoading(true);
      
      const MAX_REGISTROS = 50;
      let clientesFiltrados = filtrarClientes();
      
      if (clientesFiltrados.length > MAX_REGISTROS) {
        setError(`Por favor, refine seus filtros. Limite máximo de ${MAX_REGISTROS} registros por relatório.`);
        setLoading(false);
        return;
      }

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.276, 841.890]); // A4
      const font = await pdfDoc.embedFont('Helvetica');
      const { width, height } = page.getSize();

      // Configurações de layout
      const startX = 50;
      const colWidth = 100;
      let currentY = height - 50;
      const rowHeight = 20;
      const margin = 50;

      const addHeader = (currentPage) => {
        currentY = height - 50;
        
        // Título
        currentPage.drawText('Relatório de Clientes', {
          x: startX,
          y: currentY,
          size: 16,
          font,
        });
        currentY -= 30;

        // Data
        currentPage.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
          x: startX,
          y: currentY,
          size: 10,
          font,
        });
        currentY -= 20;

        // Cabeçalhos da tabela
        let xPos = startX;
        ['Nome', 'Idade', 'Cidade', 'Data', 'Status'].forEach(header => {
          currentPage.drawText(header, {
            x: xPos,
            y: currentY,
            size: 10,
            font,
          });
          xPos += colWidth;
        });
        currentY -= rowHeight;
      };

      // Adiciona cabeçalho na primeira página
      addHeader(page);

      // Processa os registros
      for (const cliente of clientesFiltrados) {
        // Verifica se precisa de nova página
        if (currentY <= margin) {
          page = pdfDoc.addPage([595.276, 841.890]);
          addHeader(page);
        }

        let xPos = startX;

        // Nome
        page.drawText(cliente.nome.substring(0, 20), {
          x: xPos,
          y: currentY,
          size: 9,
          font,
        });
        xPos += colWidth;

        // Idade
        page.drawText(cliente.idade.toString(), {
          x: xPos,
          y: currentY,
          size: 9,
          font,
        });
        xPos += colWidth;

        // Cidade
        page.drawText(cliente.cidade.substring(0, 15), {
          x: xPos,
          y: currentY,
          size: 9,
          font,
        });
        xPos += colWidth;

        // Data
        page.drawText(new Date(cliente.data).toLocaleDateString('pt-BR'), {
          x: xPos,
          y: currentY,
          size: 9,
          font,
        });
        xPos += colWidth;

        // Status
        page.drawText(cliente.status, {
          x: xPos,
          y: currentY,
          size: 9,
          font,
        });

        currentY -= rowHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && clientes.length === 0) {
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
            value={cidadeSelecionada}
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="todos">Todas as cidades</MenuItem>
            {cidades.map((cidade) => (
              <MenuItem key={cidade} value={cidade}>
                {cidade}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Data Início"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Data Fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
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
                  <TableCell>{cliente.idade} anos</TableCell>
                  <TableCell>{cliente.cidade}</TableCell>
                  <TableCell>{new Date(cliente.data).toLocaleDateString('pt-BR')}</TableCell>
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

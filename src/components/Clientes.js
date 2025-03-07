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
  useMediaQuery,
  Chip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DeleteIcon from '@mui/icons-material/Delete';
import { ColorModeContext } from '../App';
import { collection, query, getDocs, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { normalizeString, formatDisplayString } from '../utils/stringUtils';

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
  const [filtroStatus, setFiltroStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
          cidade: formatDisplayString(data.cidade) || '',
          horario: data.horario || '',
          status: data.status || 'Pendente',
          descricao: data.descricao || ''
        };
      });

      // Filtrar por cidade se necessário
      let clientesFiltrados = clientesData;
      if (filtroCidade) {
        clientesFiltrados = clientesData.filter(cliente => 
          normalizeString(cliente.cidade) === normalizeString(filtroCidade)
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
        where('cidade', '==', formatDisplayString(filtroCidade)),
        where('status', '==', 'disponível')
      );
      const querySnapshot = await getDocs(q);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeFormatado = hoje.toLocaleDateString('en-CA');

      const datas = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          cidade: formatDisplayString(doc.data().cidade)
        }))
        .filter(data => {
          const dataDisponivel = new Date(data.data + 'T00:00:00');
          const dataFormatada = dataDisponivel.toLocaleDateString('en-CA');
          return dataFormatada >= hojeFormatado;
        })
        .sort((a, b) => {
          const dataA = new Date(a.data + 'T00:00:00');
          const dataB = new Date(b.data + 'T00:00:00');
          
          if (dataA.getTime() !== dataB.getTime()) {
            return dataA - dataB;
          }
          
          const [horaA, minutoA] = a.horario.split(':').map(Number);
          const [horaB, minutoB] = b.horario.split(':').map(Number);
          
          if (horaA !== horaB) {
            return horaA - horaB;
          }
          return minutoA - minutoB;
        });

      setDatasDisponiveis(datas);
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
    return clientes
      .filter(cliente => {
        if (filtroCidade && cliente.cidade !== filtroCidade) {
          return false;
        }
        if (filtroPeriodo) {
          return cliente.data === filtroPeriodo;
        }
        if (filtroStatus && cliente.status_confirmacao !== filtroStatus) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Primeiro ordena por data
        const dataA = new Date(a.data + 'T00:00:00');
        const dataB = new Date(b.data + 'T00:00:00');
        
        if (dataA.getTime() !== dataB.getTime()) {
          return dataA - dataB;
        }
        
        // Se a data for igual, ordena por horário
        const [horaA, minutoA] = a.horario.split(':').map(Number);
        const [horaB, minutoB] = b.horario.split(':').map(Number);
        
        if (horaA !== horaB) {
          return horaA - horaB;
        }
        return minutoA - minutoB;
      });
  };

  const gerarPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Adiciona a logo
    const logoWidth = 14; // 40px convertido para mm (aproximadamente)
    const logoHeight = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Adiciona o container azul no topo
    const containerPadding = 2; // 5px de padding convertido para mm
    const containerHeight = logoHeight + (containerPadding * 2);
    const containerY = 5; // 5mm do topo da página

    // Centraliza o container na largura da página
    const containerWidth = logoWidth + (containerPadding * 2);
    const containerX = (pageWidth / 2) - (containerWidth / 2);
    
    doc.setFillColor(6, 9, 80); // #060950
    doc.roundedRect(containerX, containerY, containerWidth, containerHeight, 1, 1, 'F'); // Cantos levemente arredondados

    // Carrega e adiciona a imagem
    const img = new Image();
    img.src = '/logo_new.png';
    
    img.onload = () => {
      try {
        // Centraliza a logo dentro do container
        const logoX = containerX + containerPadding;
        const logoY = containerY + containerPadding;
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
        // Configurações do título (agora abaixo do container)
        doc.setFontSize(20);
        doc.setTextColor(6, 9, 80); // #060950
        doc.text('Relatório de Agendamentos', pageWidth / 2, containerY + containerHeight + 10, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Configuração das colunas da tabela
        const columns = [
          { header: 'Nome', dataKey: 'nome' },
          { header: 'Cidade', dataKey: 'cidade' },
          { header: 'Data', dataKey: 'data' },
          { header: 'Horário', dataKey: 'horario' },
          { header: 'Telefone', dataKey: 'telefone' },
          { header: 'Descrição', dataKey: 'descricao' },
          { header: 'Status', dataKey: 'status' }
        ];

        // Pegar os dados já ordenados da função filtrarClientes
        const clientesOrdenados = filtrarClientes();

        // Preparar dados para a tabela
        const dados = clientesOrdenados.map(cliente => ({
          nome: cliente.nome,
          cidade: cliente.cidade,
          data: new Date(cliente.data + 'T00:00:00').toLocaleDateString('pt-BR'),
          horario: cliente.horario,
          telefone: cliente.telefone || 'Não informado',
          descricao: cliente.descricao || '',
          status: cliente.status_confirmacao || 'Pendente'
        }));

        // Configurações da tabela (ajustada para começar após o título)
        const startY = containerY + containerHeight + 15;
        
        doc.autoTable({
          columns: columns,
          body: dados,
          startY: startY,
          styles: { fontSize: 8 },
          columnStyles: {
            nome: { cellWidth: 40 },
            cidade: { cellWidth: 30 },
            data: { cellWidth: 25 },
            horario: { cellWidth: 20 },
            telefone: { cellWidth: 35 },
            descricao: { cellWidth: 'auto' },
            status: { cellWidth: 20 }
          },
          headStyles: {
            fillColor: [6, 9, 80], // #060950
            textColor: [255, 255, 255],
            fontSize: 8,
            halign: 'center'
          },
          theme: 'grid'
        });

        doc.save('relatorio-clientes.pdf');
      } catch (error) {
        console.error('Erro ao adicionar logo:', error);
        // Se houver erro ao adicionar a logo, gera o PDF sem ela
        gerarPDFSemLogo();
      }
    };

    img.onerror = () => {
      console.error('Erro ao carregar a logo');
      // Se houver erro ao carregar a logo, gera o PDF sem ela
      gerarPDFSemLogo();
    };
  };

  // Função auxiliar para gerar o PDF sem a logo em caso de erro
  const gerarPDFSemLogo = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(20);
    doc.setTextColor(6, 9, 80);
    doc.text('Relatório de Agendamentos', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Configuração das colunas da tabela
    const columns = [
      { header: 'Nome', dataKey: 'nome' },
      { header: 'Cidade', dataKey: 'cidade' },
      { header: 'Data', dataKey: 'data' },
      { header: 'Horário', dataKey: 'horario' },
      { header: 'Telefone', dataKey: 'telefone' },
      { header: 'Descrição', dataKey: 'descricao' },
      { header: 'Status', dataKey: 'status' }
    ];

    // Pegar os dados já ordenados da função filtrarClientes
    const clientesOrdenados = filtrarClientes();

    // Preparar dados para a tabela
    const dados = clientesOrdenados.map(cliente => ({
      nome: cliente.nome,
      cidade: cliente.cidade,
      data: new Date(cliente.data + 'T00:00:00').toLocaleDateString('pt-BR'),
      horario: cliente.horario,
      telefone: cliente.telefone || 'Não informado',
      descricao: cliente.descricao || '',
      status: cliente.status_confirmacao || 'Pendente'
    }));

    // Configurações da tabela
    const startY = 20;
    
    doc.autoTable({
      columns: columns,
      body: dados,
      startY: startY,
      styles: { fontSize: 8 },
      columnStyles: {
        nome: { cellWidth: 40 },
        cidade: { cellWidth: 30 },
        data: { cellWidth: 25 },
        horario: { cellWidth: 20 },
        telefone: { cellWidth: 35 },
        descricao: { cellWidth: 'auto' },
        status: { cellWidth: 20 }
      },
      headStyles: {
        fillColor: [6, 9, 80], // #060950
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: 'center'
      },
      theme: 'grid'
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

  const handleDelete = async (clienteId) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deleteDoc(doc(db, 'agendamentos', clienteId));
        setClientes(clientes.filter(cliente => cliente.id !== clienteId));
        setSnackbarMessage('Agendamento excluído com sucesso!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        setSnackbarMessage('Erro ao excluir agendamento. Tente novamente.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
  };

  // Função para renderizar o chip de status
  const renderStatusChip = (status) => {
    if (!status) return <Chip size="small" label="Pendente" color="default" />;
    
    switch (status) {
      case 'confirmado':
        return <Chip size="small" label="Confirmado" color="success" />;
      case 'cancelado':
        return <Chip size="small" label="Cancelado" color="error" />;
      case 'pendente':
      default:
        return <Chip size="small" label="Pendente" color="warning" />;
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
            placeholder="Selecione uma cidade"
          >
            <MenuItem value="">Selecione uma cidade</MenuItem>
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
            helperText={datasDisponiveis.length === 0 && filtroCidade ? "Não há datas disponíveis para esta cidade" : ""}
          >
            <MenuItem value="">Todas as datas</MenuItem>
            {datasDisponiveis.map((data) => (
              <MenuItem key={data.id} value={data.data}>
                {new Date(data.data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: '200px' },
              flex: { sm: 1 }
            }}
          >
            <MenuItem value="">Todos os status</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="confirmado">Confirmado</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
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
                  <TableCell>{renderStatusChip(cliente.status_confirmacao)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(cliente.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Clientes;

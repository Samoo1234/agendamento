import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, getDocs, doc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const cidades = [
  'Mantena',
  'Central de Minas',
  'Mantenópolis',
  'Alto Rio Novo',
  'São João de Mantena'
];

function DatasDisponiveis() {
  const [cidade, setCidade] = useState('');
  const [data, setData] = useState('');
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    carregarDatas();
  }, []);

  const carregarDatas = async () => {
    try {
      const datasRef = collection(db, 'datas_disponiveis');
      const q = query(datasRef);
      const querySnapshot = await getDocs(q);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeFormatado = hoje.toLocaleDateString('en-CA');

      const dados = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(data => {
          // Converte a string da data para objeto Date e ajusta para o fuso horário local
          const dataAgendamento = new Date(data.data + 'T00:00:00');
          const dataFormatada = dataAgendamento.toLocaleDateString('en-CA');
          
          // Filtra apenas datas futuras ou iguais a hoje
          return dataFormatada >= hojeFormatado && data.status === 'disponível';
        });
      
      // Ordenar por data
      dados.sort((a, b) => {
        const dataA = new Date(a.data + 'T00:00:00');
        const dataB = new Date(b.data + 'T00:00:00');
        return dataA - dataB;
      });
      
      setDatas(dados);
    } catch (error) {
      console.error('Erro ao carregar datas:', error);
      setError('Erro ao carregar datas disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const verificarDataExistente = async (cidadeCheck, dataCheck) => {
    // Ajusta a data para o fuso horário local
    const dataLocal = new Date(dataCheck + 'T00:00:00');
    const dataFormatada = dataLocal.toLocaleDateString('en-CA');

    const datasRef = collection(db, 'datas_disponiveis');
    const q = query(
      datasRef,
      where('cidade', '==', cidadeCheck),
      where('data', '==', dataFormatada)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Ajusta a data para o fuso horário local antes de salvar
      const dataLocal = new Date(data + 'T00:00:00');
      const dataFormatada = dataLocal.toLocaleDateString('en-CA');

      // Verificar se a data já existe para esta cidade
      const dataExiste = await verificarDataExistente(cidade, data);
      if (dataExiste) {
        throw new Error('Esta data já está cadastrada para esta cidade');
      }

      await addDoc(collection(db, 'datas_disponiveis'), {
        cidade,
        data: dataFormatada,
        status: 'disponível',
        criadoEm: new Date()
      });
      
      setSuccess('Data cadastrada com sucesso!');
      setCidade('');
      setData('');
      carregarDatas();
    } catch (error) {
      console.error('Erro ao cadastrar data:', error);
      setError(error.message || 'Erro ao cadastrar data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'datas_disponiveis', id));
      setSuccess('Data removida com sucesso!');
      carregarDatas();
    } catch (error) {
      console.error('Erro ao deletar data:', error);
      setError('Erro ao remover data');
    }
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setCidade(data.cidade);
    // Converte a data para o formato esperado pelo input type="date"
    const dataObj = new Date(data.data + 'T00:00:00');
    const dataFormatada = dataObj.toLocaleDateString('en-CA');
    setData(dataFormatada);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      // Ajusta a data para o fuso horário local antes de salvar
      const dataLocal = new Date(data + 'T00:00:00');
      const dataFormatada = dataLocal.toLocaleDateString('en-CA');

      // Verificar se a data já existe para esta cidade (exceto a própria data sendo editada)
      const dataExiste = await verificarDataExistente(cidade, data);
      if (dataExiste && editingData.data !== dataFormatada) {
        throw new Error('Esta data já está cadastrada para esta cidade');
      }

      await updateDoc(doc(db, 'datas_disponiveis', editingData.id), {
        cidade,
        data: dataFormatada
      });
      
      setSuccess('Data atualizada com sucesso!');
      setOpenDialog(false);
      carregarDatas();
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      setError(error.message || 'Erro ao atualizar data');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'disponível' ? 'indisponível' : 'disponível';
      await updateDoc(doc(db, 'datas_disponiveis', id), {
        status: newStatus
      });
      
      setSuccess(`Status alterado para ${newStatus}`);
      carregarDatas();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro ao alterar status');
    }
  };

  if (loading && datas.length === 0) {
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
          Datas Disponíveis
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
              sx={{ minWidth: 200 }}
            >
              {cidades.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data"
              type="date"
              value={data}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                const formattedDate = selectedDate.toLocaleDateString('en-CA');
                setData(formattedDate);
              }}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cadastrar Data'}
            </Button>
          </Box>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cidade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datas.map((data) => (
              <TableRow 
                key={data.id}
                sx={{
                  backgroundColor: data.status === 'indisponível' ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                }}
              >
                <TableCell>{data.cidade}</TableCell>
                <TableCell>
                  {new Date(data.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      color: data.status === 'disponível' ? 'success.main' : 'error.main',
                      textTransform: 'capitalize'
                    }}
                  >
                    {data.status}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={data.status === 'disponível' ? 'Tornar Indisponível' : 'Tornar Disponível'}>
                    <IconButton 
                      onClick={() => handleToggleStatus(data.id, data.status)}
                      color={data.status === 'disponível' ? 'success' : 'error'}
                    >
                      {data.status === 'disponível' ? <CheckCircleIcon /> : <BlockIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEdit(data)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => handleDelete(data.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Editar Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              fullWidth
            >
              {cidades.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data"
              type="date"
              value={data}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                const formattedDate = selectedDate.toLocaleDateString('en-CA');
                setData(formattedDate);
              }}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} variant="contained">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

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

export default DatasDisponiveis;

import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, getDocs, doc, deleteDoc, where } from 'firebase/firestore';
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
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

function DatasDisponiveis() {
  const [cidade, setCidade] = useState('');
  const [data, setData] = useState('');
  const [medico, setMedico] = useState('');
  const [datas, setDatas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicosFiltrados, setMedicosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cidades, setCidades] = useState([]);

  useEffect(() => {
    carregarCidades();
    carregarMedicos();
    carregarDatas();
  }, []);

  useEffect(() => {
    if (cidade) {
      // Carrega os médicos quando a cidade é selecionada
      carregarMedicosPorCidade(cidade);
    } else {
      setMedicosFiltrados([]);
      setMedico('');
    }
  }, [cidade]);

  const carregarMedicos = async () => {
    try {
      const medicosRef = collection(db, 'medicos');
      const q = query(medicosRef);
      const querySnapshot = await getDocs(q);
      
      const dados = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
      
      setMedicos(dados);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    }
  };

  const carregarMedicosPorCidade = async (cidadeSelecionada) => {
    try {
      const medicosRef = collection(db, 'medicos');
      const q = query(medicosRef);
      const querySnapshot = await getDocs(q);
      
      const dados = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      console.log('Médicos carregados:', dados); // Debug
      setMedicos(dados);
      setMedicosFiltrados(dados); // Mostra todos os médicos já que removemos a cidade do cadastro
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setError('Erro ao carregar lista de médicos');
    }
  };

  const carregarCidades = async () => {
    try {
      const cidadesRef = collection(db, 'cidades');
      const q = query(cidadesRef);
      const querySnapshot = await getDocs(q);
      
      const dados = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
      
      setCidades(dados);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      setError('Erro ao carregar lista de cidades');
    }
  };

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
          const dataAgendamento = new Date(data.data + 'T00:00:00');
          const dataFormatada = dataAgendamento.toLocaleDateString('en-CA');
          return dataFormatada >= hojeFormatado;
        })
        .sort((a, b) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cidade || !data || !medico) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dataLocal = new Date(data + 'T00:00:00');
      const dataFormatada = dataLocal.toLocaleDateString('en-CA');

      const dataExiste = await verificarDataExistente(cidade, data);
      if (dataExiste) {
        throw new Error('Esta data já está cadastrada para esta cidade');
      }

      // Encontra os dados do médico selecionado
      const medicoSelecionado = medicos.find(m => m.id === medico);

      await addDoc(collection(db, 'datas_disponiveis'), {
        cidade,
        data: dataFormatada,
        medicoId: medico,
        medicoNome: medicoSelecionado.nome,
        status: 'disponível',
        criadoEm: new Date()
      });
      
      setSuccess('Data cadastrada com sucesso!');
      setCidade('');
      setData('');
      setMedico('');
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

  const verificarDataExistente = async (cidadeCheck, dataCheck) => {
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

  if (loading && datas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Datas Disponíveis
      </Typography>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        display: 'flex',
        gap: 2,
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <TextField
          select
          label="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          required
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: '200px' },
            '& .MuiInputBase-root': {
              height: '40px'
            }
          }}
        >
          {cidades.map((cidade) => (
            <MenuItem key={cidade.id} value={cidade.nome}>
              {cidade.nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Médico"
          value={medico}
          onChange={(e) => setMedico(e.target.value)}
          required
          size="small"
          disabled={!cidade}
          sx={{ 
            minWidth: { xs: '100%', sm: '250px' },
            '& .MuiInputBase-root': {
              height: '40px'
            }
          }}
        >
          {medicosFiltrados.map((medico) => (
            <MenuItem key={medico.id} value={medico.id}>
              {medico.nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Data"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: new Date().toISOString().split('T')[0],
            max: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            style: { height: '7px' }
          }}
          sx={{ 
            minWidth: { xs: '100%', sm: '200px' },
            '& .MuiInputBase-root': {
              height: '40px'
            }
          }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            height: '40px',
            minWidth: { xs: '100%', sm: 'auto' },
            bgcolor: '#000033',
            '&:hover': {
              bgcolor: '#000066'
            }
          }}
        >
          CADASTRAR DATA
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cidade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datas.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.cidade}</TableCell>
                <TableCell>
                  {new Date(data.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{data.medicoNome}</TableCell>
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
    </Box>
  );
}

export default DatasDisponiveis;

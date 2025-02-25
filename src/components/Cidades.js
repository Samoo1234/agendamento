import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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

function Cidades() {
  const [nome, setNome] = useState('');
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    carregarCidades();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome) {
      setError('Preencha o nome da cidade');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await addDoc(collection(db, 'cidades'), {
        nome: nome.trim(),
        criadoEm: new Date()
      });
      
      setSuccess('Cidade cadastrada com sucesso!');
      setNome('');
      carregarCidades();
    } catch (error) {
      console.error('Erro ao cadastrar cidade:', error);
      setError('Erro ao cadastrar cidade');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'cidades', id));
      setSuccess('Cidade removida com sucesso!');
      carregarCidades();
    } catch (error) {
      console.error('Erro ao deletar cidade:', error);
      setError('Erro ao remover cidade');
    }
  };

  if (loading && cidades.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Cidades
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
          label="Nome da Cidade"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: '300px' },
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
          CADASTRAR CIDADE
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cidades.map((cidade) => (
              <TableRow key={cidade.id}>
                <TableCell>{cidade.nome}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => handleDelete(cidade.id)} color="error">
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

export default Cidades;

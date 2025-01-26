import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef);
      const snapshot = await getDocs(q);
      
      const usuariosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        metadata: {
          creationTime: doc.data().dataCriacao?.toDate()?.toISOString() || new Date().toISOString()
        }
      }));
      
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarUsuario = async () => {
    try {
      setLoading(true);
      
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, novoEmail, novaSenha);
      
      // 2. Adicionar informações adicionais no Firestore
      const usuariosRef = collection(db, 'usuarios');
      await addDoc(usuariosRef, {
        uid: userCredential.user.uid,
        email: novoEmail,
        dataCriacao: serverTimestamp(),
        disabled: false
      });
      
      // 3. Atualizar a lista local
      await carregarUsuarios();
      
      setSuccess('Usuário criado com sucesso!');
      setOpenDialog(false);
      setNovoEmail('');
      setNovaSenha('');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError('Erro ao criar usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirUsuario = async (id, email) => {
    try {
      setLoading(true);
      
      // 1. Excluir do Firestore
      const usuarioRef = doc(db, 'usuarios', id);
      await deleteDoc(usuarioRef);
      
      // 2. Atualizar lista local
      setUsuarios(prev => prev.filter(user => user.id !== id));
      
      setSuccess('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError('Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      
      // 1. Encontrar usuário
      const usuario = usuarios.find(u => u.id === id);
      if (!usuario) throw new Error('Usuário não encontrado');
      
      // 2. Atualizar status no Firestore
      const usuarioRef = doc(db, 'usuarios', id);
      await updateDoc(usuarioRef, {
        disabled: !usuario.disabled
      });
      
      // 3. Atualizar lista local
      setUsuarios(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, disabled: !user.disabled };
        }
        return user;
      }));
      
      setSuccess('Status do usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status do usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gerenciar Usuários
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
            onClick={() => setOpenDialog(true)}
          >
            Novo Usuário
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    {new Date(usuario.metadata.creationTime).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!usuario.disabled}
                          onChange={() => handleToggleStatus(usuario.id)}
                          color="primary"
                        />
                      }
                      label={usuario.disabled ? 'Inativo' : 'Ativo'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleExcluirUsuario(usuario.id, usuario.email)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Novo Usuário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Senha"
            type="password"
            fullWidth
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleCriarUsuario} variant="contained" disabled={loading}>
            Criar
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

export default GerenciarUsuarios;

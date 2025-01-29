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
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
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
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ColorModeContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants/roles';

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
  const { currentUser, isAdmin, userRole } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!currentUser) return;
    carregarUsuarios();
  }, [currentUser]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosRef = collection(db, 'usuarios');
      let q;
      
      // Se não for admin, só carrega o próprio usuário
      if (!isAdmin()) {
        q = query(usuariosRef, where('uid', '==', currentUser.uid));
      } else {
        q = query(usuariosRef);
      }
      
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
    if (!isAdmin()) {
      setError('Você não tem permissão para criar usuários');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, novoEmail, novaSenha);
      
      // 2. Adicionar informações adicionais no Firestore usando o uid como ID do documento
      const userRef = doc(db, 'usuarios', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: novoEmail,
        dataCriacao: serverTimestamp(),
        disabled: false,
        role: USER_ROLES.USER // Define role padrão como USER
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
    if (!isAdmin()) {
      setError('Você não tem permissão para excluir usuários');
      return;
    }

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
    if (!isAdmin()) {
      setError('Você não tem permissão para alterar status de usuários');
      return;
    }

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

  // Função para tornar usuário admin
  const handleToggleAdmin = async (id, isAdmin) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'usuarios', id);
      await updateDoc(userRef, {
        role: isAdmin ? USER_ROLES.USER : USER_ROLES.ADMIN
      });
      
      setSuccess('Role do usuário atualizada com sucesso!');
      await carregarUsuarios();
    } catch (error) {
      setError('Erro ao atualizar role do usuário: ' + error.message);
    }
  };

  // Não mostrar nada se não houver usuário logado
  if (!currentUser) {
    return null;
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
          {isAdmin() && (
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              fullWidth={isMobile}
            >
              Novo Usuário
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, overflowX: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Data de Criação</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Admin</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {new Date(usuario.metadata.creationTime).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!usuario.disabled}
                          onChange={() => handleToggleStatus(usuario.id)}
                          disabled={!isAdmin()}
                        />
                      }
                      label={usuario.disabled ? 'Inativo' : 'Ativo'}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          display: { xs: 'none', sm: 'block' }
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={usuario.role === USER_ROLES.ADMIN}
                          onChange={() => handleToggleAdmin(usuario.id, usuario.role === USER_ROLES.ADMIN)}
                          disabled={!isAdmin()}
                        />
                      }
                      label={usuario.role === USER_ROLES.ADMIN ? "Admin" : "Usuário"}
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
        open={Boolean(success || error)}
        autoHideDuration={6000}
        onClose={() => {
          setSuccess('');
          setError('');
        }}
      >
        <Alert 
          onClose={() => {
            setSuccess('');
            setError('');
          }} 
          severity={success ? "success" : "error"}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GerenciarUsuarios;

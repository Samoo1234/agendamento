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
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  getAuth
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
import { httpsCallable } from 'firebase/functions';
import { ColorModeContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants/roles';

function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
  const [novoRole, setNovoRole] = useState(USER_ROLES.USER);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { currentUser, isAdmin, userRole } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cidades = [
    'Mantena',
    'Central de Minas',
    'Mantenópolis',
    'Alto Rio Novo',
    'São João de Mantena'
  ];

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

    if (!novaCidade) {
      setError('Por favor, selecione uma cidade');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Verificar se o email já existe
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', novoEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('Este email já está cadastrado no sistema');
        setLoading(false);
        return;
      }
      
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, novoEmail, novaSenha);
      
      // 2. Adicionar informações adicionais no Firestore usando o uid como ID do documento
      const userRef = doc(db, 'usuarios', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: novoEmail,
        cidade: novaCidade,
        dataCriacao: serverTimestamp(),
        disabled: false,
        role: novoRole // Usa o role selecionado
      });
      
      // 3. Atualizar a lista local
      await carregarUsuarios();
      
      setSuccess('Usuário criado com sucesso!');
      setOpenDialog(false);
      setNovoEmail('');
      setNovaSenha('');
      setNovaCidade('');
      setNovoRole(USER_ROLES.USER); // Reset para o valor padrão
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      let mensagemErro = 'Erro ao criar usuário';
      
      // Traduzir mensagens de erro comuns do Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensagemErro = 'Este email já está em uso';
          break;
        case 'auth/invalid-email':
          mensagemErro = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          mensagemErro = 'Operação não permitida';
          break;
        case 'auth/weak-password':
          mensagemErro = 'A senha é muito fraca. Use pelo menos 6 caracteres';
          break;
        default:
          mensagemErro = 'Erro ao criar usuário: ' + error.message;
      }
      
      setError(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirUsuario = async (uid, email) => {
    if (!isAdmin()) {
      setError('Você não tem permissão para excluir usuários');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Chamar a Cloud Function para deletar o usuário do Authentication
      const deleteUserFunction = httpsCallable(functions, 'deleteUser');
      await deleteUserFunction({ uid });

      // 2. Excluir do Firestore
      const usuarioRef = doc(db, 'usuarios', uid);
      await deleteDoc(usuarioRef);
      
      // 3. Atualizar lista local
      setUsuarios(prev => prev.filter(user => user.id !== uid));
      setSuccess('Usuário excluído com sucesso!');
      
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      let mensagemErro = 'Erro ao excluir usuário';
      
      if (error.code === 'functions/permission-denied') {
        mensagemErro = 'Você não tem permissão para excluir usuários';
      } else if (error.code === 'functions/unauthenticated') {
        mensagemErro = 'Você precisa estar autenticado para excluir usuários';
      } else if (error.code === 'functions/invalid-argument') {
        mensagemErro = 'Dados inválidos para exclusão do usuário';
      } else {
        mensagemErro = 'Erro ao excluir usuário: ' + error.message;
      }
      
      setError(mensagemErro);
      
      // Se houver erro, recarregar a lista para garantir consistência
      await carregarUsuarios();
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin() && <TableCell>Ações</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.cidade || 'Não definida'}</TableCell>
                <TableCell>{usuario.role || 'user'}</TableCell>
                <TableCell>
                  {new Date(usuario.metadata.creationTime).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!usuario.disabled}
                        onChange={() => handleToggleStatus(usuario.id)}
                        disabled={!isAdmin() || loading}
                      />
                    }
                    label={usuario.disabled ? 'Inativo' : 'Ativo'}
                  />
                </TableCell>
                {isAdmin() && (
                  <TableCell>
                    <IconButton
                      onClick={() => handleExcluirUsuario(usuario.id, usuario.email)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Criar Novo Usuário</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="cidade-label">Cidade</InputLabel>
              <Select
                labelId="cidade-label"
                value={novaCidade}
                label="Cidade"
                onChange={(e) => setNovaCidade(e.target.value)}
              >
                {cidades.map((cidade) => (
                  <MenuItem key={cidade} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="role-label">Função</InputLabel>
              <Select
                labelId="role-label"
                value={novoRole}
                label="Função"
                onChange={(e) => setNovoRole(e.target.value)}
              >
                <MenuItem value={USER_ROLES.USER}>Usuário</MenuItem>
                <MenuItem value={USER_ROLES.ADMIN}>Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleCriarUsuario} 
            disabled={loading || !novoEmail || !novaSenha || !novaCidade}
          >
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

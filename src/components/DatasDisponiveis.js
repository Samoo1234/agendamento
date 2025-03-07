import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, getDocs, doc, deleteDoc, where, updateDoc } from 'firebase/firestore';
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
import SettingsIcon from '@mui/icons-material/Settings';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

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
  
  // Estados para o diálogo de configuração de horários
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

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
    }
  };

  const carregarDatas = async () => {
    try {
      console.log('🔄 Carregando datas...');
      const datasRef = collection(db, 'agendamentos');
      const q = query(datasRef, where('status', '==', 'Disponível'));
      const querySnapshot = await getDocs(q);
      
      const dados = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📅 Documento original:', doc.id, data);
        
        return {
          id: doc.id,
          ...data,
          data: data.data || 'Data inválida',
          medicoNome: data.medicoNome || '',
          horario: data.horario || '',
          status: data.status || 'Disponível'
        };
      });

      console.log('📊 Total de datas encontradas:', dados.length);
      setDatas(dados);
      
    } catch (error) {
      console.error('❌ Erro ao carregar datas:', error);
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

      const dataExiste = await verificarDataExistente(cidade, data);
      if (dataExiste) {
        throw new Error('Esta data já está cadastrada para esta cidade');
      }

      // Encontra os dados do médico selecionado
      const medicoSelecionado = medicos.find(m => m.id === medico);

      // Cria um objeto Date com a data selecionada
      const [ano, mes, dia] = data.split('-');
      const timestamp = new Date(ano, mes - 1, dia); // mes - 1 porque em JS os meses começam em 0

      // Adiciona os períodos de atendimento padrão
      await addDoc(collection(db, 'datas_disponiveis'), {
        cidade,
        data: timestamp,
        medicoId: medico,
        medicoNome: medicoSelecionado.nome,
        status: 'disponível',
        criadoEm: new Date(),
        periodoManha: { inicio: '09:00', fim: '12:00' },
        periodoTarde: { inicio: '14:00', fim: '17:00' },
        intervalo: 10
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
    const datasRef = collection(db, 'datas_disponiveis');
    const q = query(
      datasRef,
      where('cidade', '==', cidadeCheck),
      where('data', '==', dataCheck)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Componente para configurar os horários de uma data
  function ConfigurarHorariosDialog({ open, onClose, data }) {
    const [periodoManha, setPeriodoManha] = useState({ inicio: '09:00', fim: '12:00' });
    const [periodoTarde, setPeriodoTarde] = useState({ inicio: '14:00', fim: '17:00' });
    const [intervalo, setIntervalo] = useState(10);
    const [ativarManha, setAtivarManha] = useState(true);
    const [ativarTarde, setAtivarTarde] = useState(true);

    useEffect(() => {
      if (data) {
        // Carregar configurações existentes
        if (data.periodoManha) {
          setPeriodoManha(data.periodoManha);
          setAtivarManha(true);
        } else {
          setAtivarManha(false);
        }
        
        if (data.periodoTarde) {
          setPeriodoTarde(data.periodoTarde);
          setAtivarTarde(true);
        } else {
          setAtivarTarde(false);
        }
        
        if (data.intervalo) {
          setIntervalo(data.intervalo);
        }
      }
    }, [data]);

    const handleSalvar = () => {
      // Preparar os dados para salvar
      const dadosAtualizados = {
        ...data,
        periodoManha: ativarManha ? periodoManha : null,
        periodoTarde: ativarTarde ? periodoTarde : null,
        intervalo: intervalo
      };
      
      onClose(dadosAtualizados);
    };

    return (
      <Dialog open={open} onClose={() => onClose(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configurar Horários de Atendimento
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {data?.cidade} - {data?.dataFormatada}
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={ativarManha}
                onChange={(e) => setAtivarManha(e.target.checked)}
                color="primary"
              />
            }
            label="Período da Manhã"
          />
          
          {ativarManha && (
            <Box sx={{ mb: 3, mt: 1, ml: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Início"
                    type="time"
                    value={periodoManha.inicio}
                    onChange={(e) => setPeriodoManha({ ...periodoManha, inicio: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Fim"
                    type="time"
                    value={periodoManha.fim}
                    onChange={(e) => setPeriodoManha({ ...periodoManha, fim: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          <FormControlLabel
            control={
              <Switch
                checked={ativarTarde}
                onChange={(e) => setAtivarTarde(e.target.checked)}
                color="primary"
              />
            }
            label="Período da Tarde"
          />
          
          {ativarTarde && (
            <Box sx={{ mb: 3, mt: 1, ml: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Início"
                    type="time"
                    value={periodoTarde.inicio}
                    onChange={(e) => setPeriodoTarde({ ...periodoTarde, inicio: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Fim"
                    type="time"
                    value={periodoTarde.fim}
                    onChange={(e) => setPeriodoTarde({ ...periodoTarde, fim: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="intervalo-label">Intervalo entre Horários</InputLabel>
              <Select
                labelId="intervalo-label"
                value={intervalo}
                onChange={(e) => setIntervalo(e.target.value)}
                label="Intervalo entre Horários"
              >
                <MenuItem value={5}>5 minutos</MenuItem>
                <MenuItem value={10}>10 minutos</MenuItem>
                <MenuItem value={15}>15 minutos</MenuItem>
                <MenuItem value={20}>20 minutos</MenuItem>
                <MenuItem value={30}>30 minutos</MenuItem>
                <MenuItem value={60}>60 minutos</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(null)}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Função para abrir o diálogo de configuração de horários
  const handleOpenConfig = (data) => {
    setSelectedData(data);
    setOpenDialog(true);
  };

  // Função para salvar a configuração de horários
  const handleSaveConfig = async (data) => {
    try {
      if (!selectedData) return;
      
      await updateDoc(doc(db, 'datas_disponiveis', selectedData.id), {
        periodoManha: data.periodoManha,
        periodoTarde: data.periodoTarde,
        intervalo: data.intervalo
      });
      
      setSuccess('Configuração de horários atualizada com sucesso!');
      setOpenDialog(false);
      carregarDatas();
    } catch (error) {
      console.error('Erro ao atualizar configuração de horários:', error);
      setError('Erro ao atualizar configuração de horários');
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
                  {data.data === 'Data inválida' ? (
                    <Typography color="error">Data inválida</Typography>
                  ) : (
                    new Date(data.data).toLocaleDateString('pt-BR')
                  )}
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
                  <Tooltip title="Configurar Horários">
                    <IconButton onClick={() => handleOpenConfig(data)} color="primary" sx={{ mr: 1 }}>
                      <SettingsIcon />
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

      {/* Diálogo para configuração de horários */}
      <ConfigurarHorariosDialog 
        open={openDialog} 
        onClose={(data) => {
          if (data) {
            handleSaveConfig(data);
          } else {
            setOpenDialog(false);
          }
        }} 
        data={selectedData} 
      />
    </Box>
  );
}

export default DatasDisponiveis;

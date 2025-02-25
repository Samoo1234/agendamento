import React, { useState, useEffect } from 'react';
import {
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
  Grid,
  Typography,
  Button,
  InputAdornment
} from '@mui/material';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

const cidades = [
  'Todas',
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Salvador',
  'Brasília'
];

// Dados de exemplo - serão substituídos pelos dados do Firebase
const agendamentosIniciais = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    cidade: 'São Paulo',
    data: '2025-01-27',
    horario: '14:30'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    cidade: 'Rio de Janeiro',
    data: '2025-01-28',
    horario: '09:00'
  },
  // Mais dados serão adicionados aqui
];

function Agendamentos() {
  const [filtros, setFiltros] = useState({
    cidade: 'Todas',
    data: ''
  });
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais);
  const [horarios, setHorarios] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    data: '',
    horario: '',
    whatsapp: '',
    status: 'pendente'
  });

  const handleFiltroChange = (event) => {
    const { name, value } = event.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se mudar a data ou cidade, atualiza os horários disponíveis
    if (name === 'data' || name === 'cidade') {
      if (formData.cidade && formData.data) {
        gerarHorariosDisponiveis(formData.data, formData.cidade);
      }
    }
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const cidadeMatch = filtros.cidade === 'Todas' || agendamento.cidade === filtros.cidade;
    const dataMatch = !filtros.data || agendamento.data === filtros.data;
    return cidadeMatch && dataMatch;
  });

  // Função para buscar horários já agendados
  const fetchHorariosAgendados = async (data, cidade) => {
    try {
      // Ajusta a data para manter o fuso horário local
      const dataLocal = new Date(data + 'T00:00:00');
      const dataFormatada = dataLocal.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD

      const q = query(
        collection(db, 'agendamentos'),
        where('data', '==', dataFormatada),
        where('cidade', '==', cidade)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data().horario);
    } catch (error) {
      console.error('Erro ao buscar horários agendados:', error);
      return [];
    }
  };

  // Função para gerar horários disponíveis
  const gerarHorariosDisponiveis = async (data, cidade) => {
    const horariosAgendados = await fetchHorariosAgendados(data, cidade);
    
    // Lista de todos os horários possíveis
    const todosHorarios = [
      '08:00', '09:00', '10:00', '11:00',
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // Filtra os horários já agendados
    const horariosDisponiveis = todosHorarios.filter(
      horario => !horariosAgendados.includes(horario)
    );

    setHorarios(horariosDisponiveis);
  };

  // Atualiza quando a data ou cidade mudar
  useEffect(() => {
    if (filtros.data && filtros.cidade) {
      gerarHorariosDisponiveis(filtros.data, filtros.cidade);
    }
  }, [filtros.data, filtros.cidade]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validar formato do WhatsApp
    const whatsappRegex = /^\+55\d{10,11}$/;
    if (!whatsappRegex.test(formData.whatsapp)) {
      alert('Por favor, insira um número de WhatsApp válido no formato +55DDD999999999');
      return;
    }

    try {
      // Salvar agendamento no Firestore
      const docRef = await addDoc(collection(db, 'agendamentos'), formData);
      
      // Enviar notificação via WhatsApp
      const functions = getFunctions();
      const notifyAppointment = httpsCallable(functions, 'notifyAppointment');
      
      await notifyAppointment({
        phoneNumber: formData.whatsapp,
        nome: formData.nome,
        data: formData.data,
        horario: formData.horario
      });

      alert('Agendamento realizado com sucesso! Você receberá uma mensagem de confirmação no WhatsApp.');

      // Limpar formulário e atualizar lista
      setFormData({
        nome: '',
        cidade: '',
        data: '',
        horario: '',
        whatsapp: '',
        status: 'pendente'
      });
      
      // Atualizar lista de agendamentos
      fetchAgendamentos();
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Por favor, tente novamente.');
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const q = query(collection(db, 'agendamentos'));
      const querySnapshot = await getDocs(q);
      const agendamentos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgendamentos(agendamentos);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          select
          label="Cidade"
          name="cidade"
          value={filtros.cidade}
          onChange={handleFiltroChange}
          sx={{ mr: 2 }}
        >
          {cidades.map((cidade) => (
            <MenuItem key={cidade} value={cidade}>
              {cidade}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Data"
          name="data"
          value={filtros.data}
          onChange={handleFiltroChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Paper>

      {/* Tabela de Agendamentos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Horário</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agendamentosFiltrados.map((agendamento) => (
              <TableRow key={agendamento.id}>
                <TableCell>{agendamento.nome}</TableCell>
                <TableCell>{agendamento.email}</TableCell>
                <TableCell>{agendamento.cidade}</TableCell>
                <TableCell>{agendamento.data}</TableCell>
                <TableCell>{agendamento.horario}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Horários Disponíveis */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <h2>Horários Disponíveis:</h2>
        <ul>
          {horarios.map((horario) => (
            <li key={horario}>{horario}</li>
          ))}
        </ul>
      </Paper>

      {/* Formulário de Agendamento */}
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Novo Agendamento
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 1. Cidade da consulta */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
              >
                {cidades.filter(cidade => cidade !== 'Todas').map((cidade) => (
                  <MenuItem key={cidade} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* 2. Data da consulta */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* 3. Horário da consulta */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Horário"
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                disabled={!horarios.length}
              >
                {horarios.map((horario) => (
                  <MenuItem key={horario} value={horario}>
                    {horario}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* 4. Nome completo */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
              />
            </Grid>
            {/* 5. Telefone */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="WhatsApp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="(00)00000-0000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body1" style={{ color: '#000' }}>+55</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Agendar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default Agendamentos;

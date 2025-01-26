import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const cidades = [
  'Mantena',
  'Central de Minas',
  'Mantenópolis',
  'Alto Rio Novo',
  'São João de Mantena'
];

function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const agendamentosRef = collection(db, 'agendamentos');
      const q = query(agendamentosRef);
      const querySnapshot = await getDocs(q);
      
      const dados = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAgendamentos(dados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const dadosPorCidade = {
    labels: cidades,
    datasets: [
      {
        label: 'Agendamentos por Cidade',
        data: cidades.map(cidade => 
          agendamentos.filter(a => a.cidade === cidade).length
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const dadosPorStatus = {
    labels: ['Pendente', 'Confirmado', 'Cancelado'],
    datasets: [
      {
        data: [
          agendamentos.filter(a => a.status === 'pendente').length,
          agendamentos.filter(a => a.status === 'confirmado').length,
          agendamentos.filter(a => a.status === 'cancelado').length,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const optionsBar = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Agendamentos por Cidade',
      },
    },
  };

  const optionsPie = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Status dos Agendamentos',
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Cards de Resumo */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total de Agendamentos
            </Typography>
            <Typography variant="h3">
              {agendamentos.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Confirmados
            </Typography>
            <Typography variant="h3" color="success.main">
              {agendamentos.filter(a => a.status === 'confirmado').length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Pendentes
            </Typography>
            <Typography variant="h3" color="warning.main">
              {agendamentos.filter(a => a.status === 'pendente').length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Cancelados
            </Typography>
            <Typography variant="h3" color="error.main">
              {agendamentos.filter(a => a.status === 'cancelado').length}
            </Typography>
          </Paper>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Bar options={optionsBar} data={dadosPorCidade} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Pie options={optionsPie} data={dadosPorStatus} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardHome;

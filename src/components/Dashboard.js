import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
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

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [agendamentosHoje, setAgendamentosHoje] = useState(0);
  const [proximosAgendamentos, setProximosAgendamentos] = useState(0);
  const [taxaOcupacao, setTaxaOcupacao] = useState(0);
  const [dadosPorCidade, setDadosPorCidade] = useState({
    labels: [],
    datasets: []
  });
  const [dadosPorStatus, setDadosPorStatus] = useState({
    labels: [],
    datasets: []
  });
  const [dadosPorMes, setDadosPorMes] = useState({
    labels: [],
    datasets: []
  });
  const [taxaComparecimento, setTaxaComparecimento] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const agendamentosRef = collection(db, 'agendamentos');
      const querySnapshot = await getDocs(agendamentosRef);
      const agendamentos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Total de agendamentos
      setTotalAgendamentos(agendamentos.length);

      // Agendamentos de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const agendamentosDeHoje = agendamentos.filter(ag => {
        const dataAg = new Date(ag.data);
        return dataAg.toDateString() === hoje.toDateString();
      });
      setAgendamentosHoje(agendamentosDeHoje.length);

      // Próximos agendamentos
      const proximosAg = agendamentos.filter(ag => {
        const dataAg = new Date(ag.data);
        return dataAg > hoje;
      });
      setProximosAgendamentos(proximosAg.length);

      // Taxa de ocupação
      const datasRef = collection(db, 'datas_disponiveis');
      const datasSnapshot = await getDocs(datasRef);
      const totalDatas = datasSnapshot.docs.length;
      setTaxaOcupacao(totalDatas > 0 ? (agendamentos.length / totalDatas) * 100 : 0);

      // Dados por cidade
      const dadosCidade = {};
      agendamentos.forEach(ag => {
        dadosCidade[ag.cidade] = (dadosCidade[ag.cidade] || 0) + 1;
      });

      setDadosPorCidade({
        labels: Object.keys(dadosCidade),
        datasets: [{
          label: 'Agendamentos por Cidade',
          data: Object.values(dadosCidade),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ]
        }]
      });

      // Dados por status
      const dadosStatus = {};
      agendamentos.forEach(ag => {
        dadosStatus[ag.status] = (dadosStatus[ag.status] || 0) + 1;
      });

      setDadosPorStatus({
        labels: Object.keys(dadosStatus),
        datasets: [{
          label: 'Agendamentos por Status',
          data: Object.values(dadosStatus),
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)'
          ]
        }]
      });

      // Dados por mês
      const dadosMes = {};
      agendamentos.forEach(ag => {
        const data = new Date(ag.data);
        const mes = data.toLocaleString('pt-BR', { month: 'long' });
        dadosMes[mes] = (dadosMes[mes] || 0) + 1;
      });

      setDadosPorMes({
        labels: Object.keys(dadosMes),
        datasets: [{
          label: 'Agendamentos por Mês',
          data: Object.values(dadosMes),
          backgroundColor: 'rgba(75, 192, 192, 0.5)'
        }]
      });

      // Taxa de comparecimento
      const concluidos = agendamentos.filter(ag => ag.status === 'concluído').length;
      const faltaram = agendamentos.filter(ag => ag.status === 'faltou').length;
      const total = concluidos + faltaram;

      setTaxaComparecimento({
        labels: ['Compareceram', 'Faltaram'],
        datasets: [{
          data: [
            total > 0 ? (concluidos / total) * 100 : 0,
            total > 0 ? (faltaram / total) * 100 : 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ]
        }]
      });

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Cards de resumo */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total de Agendamentos</Typography>
            <Typography variant="h4">{totalAgendamentos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Agendamentos Hoje</Typography>
            <Typography variant="h4">{agendamentosHoje}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Próximos Agendamentos</Typography>
            <Typography variant="h4">{proximosAgendamentos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Taxa de Ocupação</Typography>
            <Typography variant="h4">{taxaOcupacao.toFixed(1)}%</Typography>
          </Paper>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Agendamentos por Cidade</Typography>
            <Bar data={dadosPorCidade} options={{ responsive: true }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Status dos Agendamentos</Typography>
            <Pie data={dadosPorStatus} options={{ responsive: true }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Agendamentos por Mês</Typography>
            <Bar data={dadosPorMes} options={{ responsive: true }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Taxa de Comparecimento</Typography>
            <Pie data={taxaComparecimento} options={{ responsive: true }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

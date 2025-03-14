import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Formulario from './components/Formulario';
import Login from './components/Login';
import DashboardHome from './components/Dashboard';
import DatasDisponiveis from './components/DatasDisponiveis';
import Clientes from './components/Clientes';
import GerenciarUsuarios from './components/GerenciarUsuarios';
import Medicos from './components/Medicos';
import Cidades from './components/Cidades';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { InactivityProvider } from './contexts/InactivityContext';

// Criando contexto para o tema
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function App() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#000033',
          },
          secondary: {
            main: '#1a1a1a',
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Formulario />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <InactivityProvider>
                      <Layout>
                        <DashboardHome />
                      </Layout>
                    </InactivityProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/datas"
                element={
                  <PrivateRoute>
                    <InactivityProvider>
                      <Layout>
                        <DatasDisponiveis />
                      </Layout>
                    </InactivityProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicos"
                element={
                  <PrivateRoute>
                    <InactivityProvider>
                      <Layout>
                        <Medicos />
                      </Layout>
                    </InactivityProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/cidades"
                element={
                  <PrivateRoute>
                    <InactivityProvider>
                      <Layout>
                        <Cidades />
                      </Layout>
                    </InactivityProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <PrivateRoute>
                    <InactivityProvider>
                      <Layout>
                        <Clientes />
                      </Layout>
                    </InactivityProvider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <PrivateRoute>
                    <InactivityProvider>
                      <Layout>
                        <GerenciarUsuarios />
                      </Layout>
                    </InactivityProvider>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

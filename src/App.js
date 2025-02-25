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
            main: '#060950',
            light: '#2f3275',
            dark: '#03042e',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#1a237e',
            light: '#534bae',
            dark: '#000051',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: '#060950',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
              contained: {
                backgroundColor: '#060950',
                '&:hover': {
                  backgroundColor: '#03042e',
                },
              },
            },
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

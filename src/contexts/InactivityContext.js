import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const InactivityContext = createContext();

export function useInactivity() {
  return useContext(InactivityContext);
}

const TIMEOUT_DURATION = 58 * 60 * 1000 + 2 * 60 * 1000; // 58 minutos + 2 minutos de aviso em milissegundos
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutos antes do timeout

export function InactivityProvider({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [timeoutId, setTimeoutId] = useState(null);
  const [warningTimeoutId, setWarningTimeoutId] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(WARNING_BEFORE_TIMEOUT);
  const [countdownId, setCountdownId] = useState(null);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [navigate]);

  const startCountdown = useCallback(() => {
    setRemainingTime(WARNING_BEFORE_TIMEOUT);
    const id = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1000) {
          clearInterval(id);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    setCountdownId(id);
  }, []);

  const resetAllTimers = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    if (countdownId) clearInterval(countdownId);
    setShowWarning(false);
    setLastActivity(Date.now());
    setupInactivityTimeout();
  }, [timeoutId, warningTimeoutId, countdownId]);

  const setupInactivityTimeout = useCallback(() => {
    // Configura o aviso
    const warningId = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, TIMEOUT_DURATION - WARNING_BEFORE_TIMEOUT);

    // Configura o logout
    const timeoutId = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);

    setWarningTimeoutId(warningId);
    setTimeoutId(timeoutId);
  }, [handleLogout, startCountdown]);

  useEffect(() => {
    if (currentUser && isAdmin()) {
      const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        window.addEventListener(event, resetAllTimers);
      });

      setupInactivityTimeout();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (warningTimeoutId) clearTimeout(warningTimeoutId);
        if (countdownId) clearInterval(countdownId);
        
        events.forEach(event => {
          window.removeEventListener(event, resetAllTimers);
        });
      };
    }
  }, [currentUser, isAdmin, setupInactivityTimeout, resetAllTimers, timeoutId, warningTimeoutId, countdownId]);

  const handleStayLoggedIn = () => {
    resetAllTimers();
  };

  return (
    <InactivityContext.Provider value={{ resetTimer: resetAllTimers }}>
      {children}
      <Dialog
        open={showWarning}
        onClose={handleStayLoggedIn}
      >
        <DialogTitle>
          Aviso de Inatividade
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sua sessão será encerrada em breve por inatividade.
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress 
              variant="determinate" 
              value={(remainingTime / WARNING_BEFORE_TIMEOUT) * 100} 
            />
            <Typography variant="body2" sx={{ ml: 2 }}>
              {Math.ceil(remainingTime / 1000)} segundos
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="error">
            Sair Agora
          </Button>
          <Button onClick={handleStayLoggedIn} variant="contained" autoFocus>
            Continuar Conectado
          </Button>
        </DialogActions>
      </Dialog>
    </InactivityContext.Provider>
  );
}

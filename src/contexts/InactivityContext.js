import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const InactivityContext = createContext();

export function useInactivity() {
  return useContext(InactivityContext);
}

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

export function InactivityProvider({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [timeoutId, setTimeoutId] = useState(null);

  const resetTimer = () => {
    setLastActivity(Date.now());
  };

  const setupInactivityTimeout = () => {
    // Limpa o timeout anterior se existir
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Configura novo timeout
    const id = setTimeout(async () => {
      if (currentUser && isAdmin()) {
        try {
          await auth.signOut();
          navigate('/login');
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }
      }
    }, TIMEOUT_DURATION);

    setTimeoutId(id);
  };

  useEffect(() => {
    if (currentUser && isAdmin()) {
      // Lista de eventos para monitorar atividade
      const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart'
      ];

      // Adiciona os event listeners
      const handleActivity = () => {
        resetTimer();
        setupInactivityTimeout();
      };

      events.forEach(event => {
        document.addEventListener(event, handleActivity);
      });

      // Configura o timeout inicial
      setupInactivityTimeout();

      // Cleanup
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [currentUser, isAdmin]);

  return (
    <InactivityContext.Provider value={{ resetTimer }}>
      {children}
    </InactivityContext.Provider>
  );
}

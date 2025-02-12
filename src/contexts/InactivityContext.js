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
      const resetTimeout = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setupInactivityTimeout();
      };

      // Adiciona os event listeners
      window.addEventListener('mousemove', resetTimeout);
      window.addEventListener('keypress', resetTimeout);

      // Configura o timeout inicial
      setupInactivityTimeout();

      // Cleanup
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        window.removeEventListener('mousemove', resetTimeout);
        window.removeEventListener('keypress', resetTimeout);
      };
    }
  }, [timeoutId, setupInactivityTimeout]);

  return (
    <InactivityContext.Provider value={{ resetTimer }}>
      {children}
    </InactivityContext.Provider>
  );
}

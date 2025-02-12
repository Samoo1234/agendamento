import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { USER_ROLES, DEFAULT_ROLE } from '../constants/roles';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userCity, setUserCity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar role e cidade do usuário
  const fetchUserData = async (uid) => {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return {
          role: userData.role || DEFAULT_ROLE,
          city: userData.cidade || null
        };
      }
      return { role: DEFAULT_ROLE, city: null };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return { role: DEFAULT_ROLE, city: null };
    }
  };

  // Função para verificar se o usuário é admin
  const isAdmin = () => userRole === USER_ROLES.ADMIN;

  // Função para verificar se o usuário tem permissão para acessar dados de outro usuário
  const hasPermission = (targetUserId) => {
    return currentUser?.uid === targetUserId || isAdmin();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchUserData(user.uid);
        setUserRole(userData.role);
        setUserCity(userData.city);
        setCurrentUser(user);
      } else {
        setUserRole(null);
        setUserCity(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userCity,
    isAdmin,
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

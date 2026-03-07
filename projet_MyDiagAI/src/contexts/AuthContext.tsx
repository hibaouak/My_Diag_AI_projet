import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Définir le type de l'utilisateur
interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  created_at: string;
}

// Définir le type du contexte
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (userData: RegisterData) => Promise<RegisterResult>;
  login: (credentials: LoginData) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Types pour les données
interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface LoginResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Le provider d'authentification
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Vérifier si l'utilisateur est déjà connecté
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erreur parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  };

  // Inscription
  const register = async (userData: RegisterData): Promise<RegisterResult> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        full_name: userData.full_name,
        email: userData.email.toLowerCase(),
        password: userData.password
      });
      
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'inscription' 
      };
    }
  };

  // Connexion
  const login = async (credentials: LoginData): Promise<LoginResult> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: credentials.email.toLowerCase(),
        password: credentials.password
      });
      
      if (response.data.success) {
        // Mettre à jour l'état
        setUser(response.data.user);
        setToken(response.data.token);
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Email ou mot de passe incorrect' 
      };
    }
  };

  // Déconnexion
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    return !!token;
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
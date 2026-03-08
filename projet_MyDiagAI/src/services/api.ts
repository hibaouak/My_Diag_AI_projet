// src/services/api.ts - Version corrigée avec authentification
import axios from 'axios';

// URL du backend - À MODIFIER SELON VOTRE ENVIRONNEMENT
const BACKEND_URL = 'http://localhost:5000';
console.log('🌐 Backend URL:', BACKEND_URL);

// Types
export interface DiagnosisRequest {
  symptoms: string[];
  age: number;
  gender: 'M' | 'F';
  patient_name?: string;  // ← AJOUTÉ
  additional_notes?: string;
}

export interface DiagnosisResponse {
  success: boolean;
  diagnostic_assistant?: {
    results: Array<{
      disease: string;
      probability_percent: number;
      probability_decimal: number;
      confidence_level: string;
      medical_action: string;
      specific_guidance: string;
      suggested_tests: string[];
      risk_level: string;
      recommendations: string[];
    }>;
    patient_info: {
      age: number;
      gender: string;
      patient_name?: string;  // ← AJOUTÉ
      symptoms_analyzed: string[];
      additional_notes?: string;
    };
    diagnostic_id?: string;  // ← AJOUTÉ
    mode?: string;  // ← AJOUTÉ
    disclaimer?: string;
  };
  results?: Array<{
    disease: string;
    probability_percent: number;
    probability_decimal: number;
    confidence_level: string;
    medical_action: string;
    specific_guidance: string;
    suggested_tests: string[];
    risk_level: string;
    recommendations: string[];
  }>;
  error?: string;
}

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Configuration CORS
api.defaults.withCredentials = false;

// ✅ INTERCEPTEUR POUR AJOUTER LE TOKEN D'AUTHENTIFICATION
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    
    // Log de la requête
    console.log(`🚀 API: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Ajouter le token s'il existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token ajouté: ${token.substring(0, 10)}...`);
    } else {
      console.log('⚠️ Pas de token pour cette requête');
      
      // Si c'est une route protégée, on peut afficher un avertissement
      const protectedRoutes = ['/api/dashboard', '/api/diagnose', '/api/stats', '/api/history'];
      const isProtected = protectedRoutes.some(route => config.url?.includes(route));
      
      if (isProtected) {
        console.warn(`⚠️ Route protégée ${config.url} sans token !`);
      }
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTEUR POUR GÉRER LES ERREURS 401 (Non autorisé)
api.interceptors.response.use(
  response => {
    console.log(`✅ API ${response.status}: ${response.config.url}`);
    return response;
  },
  error => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Gestion spécifique des erreurs 401 (token invalide ou expiré)
    if (error.response?.status === 401) {
      console.log('❌ Session expirée - Redirection vers login');
      
      // Supprimer les données d'authentification
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de login si on n'y est pas déjà
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    
    // Messages d'erreur conviviaux
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend Flask est démarré sur http://localhost:5000');
    }
    
    throw error;
  }
);

// ==================== SERVICES ====================

export const checkHealth = async () => {
  try {
    // Utiliser la route /api/health qui existe maintenant
    const response = await api.get('/api/health');
    console.log('✅ Backend health:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Backend unreachable');
    throw error;
  }
};

export const getSymptoms = async () => {
  try {
    console.log('🔄 Loading symptoms...');
    
    // Essayer l'API d'abord
    try {
      const response = await api.get('/api/symptoms');
      const data = response.data;
      
      if (data && data.symptoms && Array.isArray(data.symptoms)) {
        console.log(`✅ ${data.symptoms.length} symptoms loaded from API`);
        return data.symptoms;
      }
      
      if (Array.isArray(data)) {
        console.log(`✅ ${data.length} symptoms loaded (array format)`);
        return data;
      }
      
      throw new Error('Unexpected response format');
      
    } catch (apiError) {
      console.warn('⚠️ API failed, trying direct fetch...');
      
      // Fallback: fetch direct
      const response = await fetch('http://localhost:5000/api/symptoms');
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      
      const data = await response.json();
      return data.symptoms || [];
    }
    
  } catch (error) {
    console.error('❌ All symptom loading methods failed');
    
    // Emergency fallback: hardcoded symptoms
    const emergencySymptoms = [
      "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering",
      "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue",
      "muscle_wasting", "vomiting", "burning_micturition", "fatigue", "cough",
      "high_fever", "headache", "nausea", "loss_of_appetite", "back_pain"
    ];
    
    console.log(`⚠️ Using emergency list: ${emergencySymptoms.length} symptoms`);
    return emergencySymptoms;
  }
};

export const getDiseases = async () => {
  try {
    const response = await api.get('/api/diseases');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to load diseases');
    return { diseases: [], count: 0 };
  }
};

// ✅ VERSION CORRIGÉE DE getDashboardStats
export const getDashboardStats = async () => {
  try {
    console.log('🏠 Récupération des stats dashboard...');
    
    // L'intercepteur ajoutera automatiquement le token
    const response = await api.get('/api/dashboard');
    
    console.log('✅ Dashboard stats reçues:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    return {
      recent_diagnostics: [],
      top_diseases: [],
      total_diagnostics: 0,
      total_patients: 0,
      accuracy: 0
    };
  }
};

// ✅ VERSION CORRIGÉE - Plus de fallback, on laisse l'erreur remonter
export const performDiagnosis = async (data: DiagnosisRequest): Promise<DiagnosisResponse> => {
  try {
    console.log('📤 Envoi des données de diagnostic:', data);
    
    // S'assurer que patient_name est inclus
    const requestData = {
      ...data,
      patient_name: data.patient_name || 'Patient'  // Valeur par défaut
    };
    
    const response = await api.post('/api/diagnose', requestData);
    console.log('✅ Réponse API reçue:', response.data);
    
    // La réponse devrait déjà être au bon format depuis le backend
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Erreur lors du diagnostic:', error);
    
    // Vérifier si c'est une erreur 401 (non authentifié)
    if (error.response?.status === 401) {
      console.log('🔑 Token invalide - Redirection vers login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      throw new Error('Session expirée');
    }
    
    // Si c'est une erreur 500 (interne du serveur), on affiche l'erreur
    if (error.response?.status === 500) {
      console.error('❌ Erreur serveur 500:', error.response.data);
      throw new Error(error.response.data?.error || 'Erreur interne du serveur');
    }
    
    // En cas d'erreur réseau ou autre, on la remonte
    throw error;
  }
};

export default api;
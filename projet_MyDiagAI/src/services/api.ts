// src/services/api.ts - Version simplifiée sans env
import axios from 'axios';

// URL du backend - À MODIFIER SELON VOTRE ENVIRONNEMENT
const BACKEND_URL = 'http://localhost:5000';
console.log('🌐 Backend URL:', BACKEND_URL);

// Types
export interface DiagnosisRequest {
  symptoms: string[];
  age: number;
  gender: 'M' | 'F';
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
      symptoms_analyzed: string[];
      additional_notes?: string;
    };
    disclaimer: string;
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

// Logging des requêtes
api.interceptors.request.use(config => {
  console.log(`🚀 API: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Gestion des erreurs
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
    const response = await api.get('/api/health');
    console.log('✅ Backend health:', response.data.status);
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

// Fonction performDiagnosis - ajouter un formatage
// src/services/api.ts - Correction de l'endpoint
export const performDiagnosis = async (data: DiagnosisRequest): Promise<DiagnosisResponse> => {
  try {
    console.log('📤 Envoi des données de diagnostic:', data);
    
    // CORRECTION: Changer '/diagnose' en '/api/diagnose'
    const response = await api.post('/api/diagnose', data); // CHANGER ICI
    console.log('✅ Réponse API reçue:', response.data);
    
    // Formatage de la réponse pour assurer la cohérence
    const formattedResponse = formatDiagnosisResponse(response.data);
    console.log('🔄 Réponse formatée:', formattedResponse);
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    
    // En cas d'erreur, retourner un format de démonstration cohérent
    return {
      success: false,
      diagnostic_assistant: {
        results: [
          {
            disease: "Common Cold",
            probability_percent: 78.5,
            probability_decimal: 0.785,
            confidence_level: "ÉLEVÉE - Diagnostic plausible",
            medical_action: "Traitement symptomatique recommandé",
            specific_guidance: "Repos et hydratation. Surveillance de la température.",
            suggested_tests: ["Température", "Examen ORL"],
            risk_level: "Faible",
            recommendations: [
              "Repos au lit",
              "Hydratation abondante",
              "Antipyrétiques si fièvre > 38.5°C"
            ]
          }
        ],
        patient_info: {
          age: data.age,
          gender: data.gender,
          symptoms_analyzed: data.symptoms,
          additional_notes: data.additional_notes
        },
        disclaimer: "Mode démonstration - Résultats simulés"
      }
    };
  }
};

// Fonction de formatage de la réponse
const formatDiagnosisResponse = (apiResponse: any): DiagnosisResponse => {
  // Si l'API retourne déjà le bon format
  if (apiResponse.diagnostic_assistant || apiResponse.results) {
    return apiResponse;
  }
  
  // Si l'API retourne un format différent, l'adapter
  if (apiResponse.diagnosis && Array.isArray(apiResponse.diagnosis)) {
    return {
      success: true,
      diagnostic_assistant: {
        results: apiResponse.diagnosis.map((item: any) => ({
          disease: item.disease_name || item.name,
          probability_percent: item.probability ? item.probability * 100 : 0,
          probability_decimal: item.probability || 0,
          confidence_level: item.confidence || "MODÉRÉE",
          medical_action: item.recommendation || "Consulter un médecin",
          specific_guidance: item.description || "",
          suggested_tests: item.tests || [],
          risk_level: item.severity || "Modéré",
          recommendations: item.treatment_plan || []
        })),
        patient_info: apiResponse.patient_info || {},
        disclaimer: apiResponse.disclaimer || "Résultats du diagnostic IA"
      }
    };
  }
  
  // Retourner la réponse telle quelle
  return apiResponse;
};

export default api;
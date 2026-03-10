// src/services/historyService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Diagnostic {
  id: string;
  patient_name: string;
  age?: number;
  gender?: string;
  symptoms: string[];
  results: Array<{
    disease: string;
    probability_percent: number;
    probability_decimal: number;
    confidence_level: string;
    medical_action: string;
    specific_guidance: string;
    suggested_tests: string[];
    risk_level: string;
  }>;
  notes?: string;
  created_at: string;
  doctor_id?: string;
}

export interface HistoryResponse {
  count: number;
  diagnostics: Diagnostic[];
  total: number;
  symptoms_count: number;
}

export const getHistory = async (
  limit = 50,
  offset = 0
): Promise<HistoryResponse> => {
  const token = localStorage.getItem('token'); // ou depuis votre contexte d'authentification
  const response = await fetch(
    `${API_BASE_URL}/history?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors du chargement de l\'historique');
  }

  return response.json();
};
// src/services/statsService.ts
import api from './api';

export interface StatsResponse {
  total_diagnostics: number;
  total_patients: number;
  average_accuracy: number;
  average_duration: number;
  top_diseases: Array<{ disease: string; count: number; trend: string }>;
  monthly_stats: Array<{ month: string; diagnostics: number }>;
  category_stats: Array<{ category: string; percentage: number; color: string }>;
}

export const getStats = async (): Promise<StatsResponse> => {
  try {
    console.log('📊 Récupération des statistiques...');
    const response = await api.get('/api/stats');
    console.log('✅ Statistiques reçues:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error);
    
    // Retourner des stats par défaut
    return {
      total_diagnostics: 0,
      total_patients: 0,
      average_accuracy: 0,
      average_duration: 0,
      top_diseases: [],
      monthly_stats: [],
      category_stats: []
    };
  }
};

export const getDashboardStats = async () => {
  try {
    console.log('🏠 Récupération des stats dashboard...');
    const response = await api.get('/api/dashboard');
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
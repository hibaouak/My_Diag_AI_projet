// src/services/patientStatsService.ts
import api from './api';

export interface PatientStats {
  total_searches: number;
  average_confidence: number;
  top_specialties: Array<{
    specialty: string;
    count: number;
    percentage: number;
  }>;
  recent_searches: Array<{
    specialty: string;
    disease: string;
    date: string;
    confidence: number;
  }>;
}

export const getPatientStats = async (): Promise<PatientStats> => {
  try {
    console.log('📊 Récupération des statistiques patient...');
    const response = await api.get('/api/patient-stats');
    
    if (response.data.success) {
      console.log('✅ Statistiques reçues:', response.data.stats);
      return response.data.stats;
    } else {
      console.error('❌ Erreur stats:', response.data.error);
      return {
        total_searches: 0,
        average_confidence: 0,
        top_specialties: [],
        recent_searches: []
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error);
    return {
      total_searches: 0,
      average_confidence: 0,
      top_specialties: [],
      recent_searches: []
    };
  }
};

export const resetPatientStats = async (): Promise<boolean> => {
  try {
    console.log('🔄 Réinitialisation des statistiques...');
    const response = await api.post('/api/patient-stats/reset');
    
    if (response.data.success) {
      console.log('✅ Statistiques réinitialisées');
      return true;
    } else {
      console.error('❌ Erreur reset:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    return false;
  }
};
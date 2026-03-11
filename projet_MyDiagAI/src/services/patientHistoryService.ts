// src/services/patientHistoryService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface PatientConsultation {
  id: string;
  doctor_name: string;
  doctor_specialty: string;
  clinic_name: string;
  date: string; // ISO string
  symptoms?: string[];
  status: 'confirmé' | 'en attente' | 'annulé';
  rating?: number; // Note donnée par le patient
  // Champs supplémentaires (utiles pour l'affichage)
  patient_name?: string;
  disease?: string;
}

export interface PatientHistoryResponse {
  count: number;
  consultations: PatientConsultation[];
  total: number;
}

export const getPatientHistory = async (
  limit = 50,
  offset = 0
): Promise<PatientHistoryResponse> => {
  const token = localStorage.getItem('patientToken'); // ou token patient
  const response = await fetch(
    `${API_BASE_URL}/patient/history?limit=${limit}&offset=${offset}`,
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
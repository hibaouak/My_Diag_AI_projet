// src/services/dataTransformer.ts

/**
 * Transforme les données de l'API en un format cohérent pour l'affichage
 */
export const transformDiagnosticData = (apiData: any, patientInfo?: any, selectedSymptoms?: string[]) => {
  if (!apiData) return null;
  
  // Format 1: Réponse API complète avec diagnostic_assistant
  if (apiData.diagnostic_assistant && apiData.diagnostic_assistant.results) {
    return {
      success: true,
      results: apiData.diagnostic_assistant.results,
      patient_info: apiData.diagnostic_assistant.patient_info || patientInfo,
      statistics: calculateStatistics(apiData.diagnostic_assistant.results, selectedSymptoms),
      disclaimer: apiData.diagnostic_assistant.disclaimer || "Résultat du diagnostic IA",
      mode: 'production'
    };
  }
  
  // Format 2: Réponse directe avec results
  if (apiData.results && Array.isArray(apiData.results)) {
    return {
      success: true,
      results: apiData.results,
      patient_info: apiData.patient_info || patientInfo,
      statistics: calculateStatistics(apiData.results, selectedSymptoms),
      disclaimer: apiData.disclaimer || "Résultat du diagnostic IA",
      mode: 'production'
    };
  }
  
  // Format 3: Réponse simplifiée
  if (apiData.diagnosis && Array.isArray(apiData.diagnosis)) {
    return {
      success: true,
      results: apiData.diagnosis.map((item: any) => ({
        disease: item.disease_name || item.name,
        probability_percent: item.probability * 100,
        probability_decimal: item.probability,
        confidence_level: getConfidenceLevel(item.probability),
        risk_level: getRiskLevel(item.severity || 'medium'),
        description: item.description
      })),
      patient_info: patientInfo,
      statistics: calculateStatistics(apiData.diagnosis, selectedSymptoms),
      disclaimer: "Résultat du diagnostic IA",
      mode: 'production'
    };
  }
  
  return null;
};

/**
 * Calcule les statistiques à partir des résultats
 */
export const calculateStatistics = (results: any[], symptoms: string[] = []) => {
  if (!results || results.length === 0) {
    return {
      symptoms_count: symptoms.length,
      top_diagnosis: "Non déterminé",
      top_probability: 0,
      differential_diagnosis_count: 0,
      high_probability_count: 0,
      timestamp: new Date().toISOString()
    };
  }

  const sortedResults = [...results].sort((a, b) => 
    (b.probability_percent || b.probability || 0) - (a.probability_percent || a.probability || 0)
  );

  const topResult = sortedResults[0];
  
  return {
    symptoms_count: symptoms.length,
    top_diagnosis: topResult?.disease || topResult?.disease_name || "Non déterminé",
    top_probability: topResult?.probability_percent || (topResult?.probability || 0) * 100,
    differential_diagnosis_count: results.length,
    high_probability_count: results.filter(r => 
      (r.probability_percent || (r.probability || 0) * 100) > 70
    ).length,
    timestamp: new Date().toISOString()
  };
};

/**
 * Détermine le niveau de confiance basé sur la probabilité
 */
const getConfidenceLevel = (probability: number): string => {
  if (probability >= 0.8) return "TRÈS ÉLEVÉE - Diagnostic très probable";
  if (probability >= 0.6) return "ÉLEVÉE - Diagnostic plausible";
  if (probability >= 0.4) return "MODÉRÉE - Hypothèse à explorer";
  return "FAIBLE - Possibilité à considérer";
};

/**
 * Détermine le niveau de risque
 */
const getRiskLevel = (severity: string): string => {
  const levels: Record<string, string> = {
    'high': 'Élevé',
    'medium': 'Modéré',
    'low': 'Faible',
    'severe': 'Élevé',
    'mild': 'Faible'
  };
  return levels[severity.toLowerCase()] || 'Modéré';
};

/**
 * Normalise les noms de symptômes
 */
export const formatSymptomName = (symptom: string): string => {
  return symptom
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Traduit le genre
 */
export const translateGender = (gender: string): string => {
  const translations: Record<string, string> = {
    'M': 'Homme',
    'F': 'Femme',
    'male': 'Homme',
    'female': 'Femme',
    'Male': 'Homme',
    'Female': 'Femme',
    'homme': 'Homme',
    'femme': 'Femme'
  };
  return translations[gender] || gender || 'Non spécifié';
};
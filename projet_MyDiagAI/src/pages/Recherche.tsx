import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Liste complète des symptômes basée sur le fichier CSV
const SYMPTOMES = [
  "anxiety and nervousness",
  "depression",
  "shortness of breath",
  "sharp chest pain",
  "dizziness",
  "insomnia",
  "palpitations",
  "irregular heartbeat",
  "breathing fast",
  "hoarse voice",
  "sore throat",
  "difficulty speaking",
  "cough",
  "nasal congestion",
  "throat swelling",
  "difficulty in swallowing",
  "vomiting",
  "headache",
  "nausea",
  "diarrhea",
  "painful urination",
  "frequent urination",
  "blood in urine",
  "hand or finger pain",
  "arm pain",
  "back pain",
  "neck pain",
  "low back pain",
  "knee pain",
  "foot or toe pain",
  "ankle pain",
  "joint pain",
  "muscle pain",
  "muscle stiffness or tightness",
  "fatigue",
  "fever",
  "chills",
  "weight gain",
  "recent weight loss",
  "decreased appetite",
  "excessive appetite",
  "swollen lymph nodes",
  "skin rash",
  "skin lesion",
  "acne or pimples",
  "mouth ulcer",
  "eye redness",
  "diminished vision",
  "double vision",
  "seizures"
].sort();

interface SymptomeState {
  [key: string]: boolean;
}

// Interface pour les résultats de prédiction
interface Doctor {
  id: number;
  name: string;
  specialite: string;
  adresse: string;
  telephone: string;
  email: string;
  ville: string;
  clinique: string;
}

interface PredictionResult {
  success: boolean;
  prediction: {
    disease: string;
    specialty: string;
    confidence: number;
    alternatives?: Array<{
      maladie: string;
      probabilite: number;
      specialite: string;
    }>;
  };
  doctors: Doctor[];
  symptoms_found: string[];
}

// Interface pour les statistiques
interface SearchStats {
  total_searches: number;
  top_specialties: Array<{
    specialty: string;
    count: number;
    percentage: number;
  }>;
  average_confidence: number;
  recent_searches: Array<{
    specialty: string;
    disease: string;
    date: string;
    confidence: number;
  }>;
}

const SymptomeSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptomes, setSelectedSymptomes] = useState<SymptomeState>({});
  const [filteredSymptomes, setFilteredSymptomes] = useState(SYMPTOMES);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour la gestion de l'API
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtrer les symptômes en fonction de la recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredSymptomes(SYMPTOMES);
    } else {
      const filtered = SYMPTOMES.filter(symptome => 
        symptome.toLowerCase().includes(term)
      );
      setFilteredSymptomes(filtered);
    }
  };

  // Sélectionner/désélectionner un symptôme
  const toggleSymptome = (symptome: string) => {
    setSelectedSymptomes(prev => ({
      ...prev,
      [symptome]: !prev[symptome]
    }));
    setResult(null);
    setError(null);
  };

  // Sélectionner tous les symptômes filtrés
  const selectAllFiltered = () => {
    const newSelected = { ...selectedSymptomes };
    filteredSymptomes.forEach(symptome => {
      newSelected[symptome] = true;
    });
    setSelectedSymptomes(newSelected);
    setResult(null);
    setError(null);
  };

  // Désélectionner tous les symptômes
  const deselectAll = () => {
    setSelectedSymptomes({});
    setResult(null);
    setError(null);
  };

  // Sélectionner les symptômes courants
  const selectCommonSymptomes = () => {
    const common = [
      "headache",
      "fatigue",
      "fever",
      "cough",
      "nausea",
      "dizziness"
    ];
    const newSelected = { ...selectedSymptomes };
    common.forEach(symptome => {
      newSelected[symptome] = true;
    });
    setSelectedSymptomes(newSelected);
    setResult(null);
    setError(null);
  };

  // Compter le nombre de symptômes sélectionnés
  const selectedCount = Object.values(selectedSymptomes).filter(Boolean).length;

  // ===== FONCTION POUR METTRE À JOUR LES STATISTIQUES =====
  const updateLocalStats = (specialty: string, disease: string, confidence: number) => {
    try {
      // Récupérer les stats actuelles
      const saved = localStorage.getItem('patientSearchStats');
      let stats: SearchStats = saved ? JSON.parse(saved) : {
        total_searches: 0,
        top_specialties: [],
        average_confidence: 0,
        recent_searches: []
      };
      
      // Incrémenter le compteur
      stats.total_searches += 1;
      
      // Mettre à jour la moyenne de confiance
      if (stats.total_searches === 1) {
        stats.average_confidence = confidence;
      } else {
        const oldTotal = (stats.average_confidence * (stats.total_searches - 1));
        stats.average_confidence = Math.round((oldTotal + confidence) / stats.total_searches);
      }
      
      // Ajouter aux recherches récentes
      stats.recent_searches.unshift({
        specialty: specialty,
        disease: disease,
        date: new Date().toISOString(),
        confidence: confidence
      });
      
      // Garder seulement les 10 dernières
      if (stats.recent_searches.length > 10) {
        stats.recent_searches = stats.recent_searches.slice(0, 10);
      }
      
      // Mettre à jour le compteur de spécialités
      const specialtyIndex = stats.top_specialties.findIndex(s => s.specialty === specialty);
      if (specialtyIndex >= 0) {
        stats.top_specialties[specialtyIndex].count += 1;
      } else {
        stats.top_specialties.push({
          specialty: specialty,
          count: 1,
          percentage: 0
        });
      }
      
      // Recalculer les pourcentages
      stats.top_specialties = stats.top_specialties.map(item => ({
        ...item,
        percentage: (item.count / stats.total_searches) * 100
      }));
      
      // Trier par nombre de recherches
      stats.top_specialties.sort((a, b) => b.count - a.count);
      
      // Sauvegarder
      localStorage.setItem('patientSearchStats', JSON.stringify(stats));
      console.log('✅ Statistiques mises à jour:', stats);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour stats:', error);
    }
  };

  // Soumettre la recherche à l'API
  const handleSubmit = async () => {
    const selectedList = Object.entries(selectedSymptomes)
      .filter(([_, selected]) => selected)
      .map(([symptome]) => symptome);
    
    if (selectedList.length === 0) {
      setError('Veuillez sélectionner au moins un symptôme');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Envoi des symptômes:', selectedList);
      
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: selectedList })
      });

      const data = await response.json();
      console.log('📥 Réponse reçue:', data);

      if (data.success) {
        setResult(data);
        
        // ===== METTRE À JOUR LES STATISTIQUES =====
        updateLocalStats(
          data.prediction.specialty,
          data.prediction.disease,
          data.prediction.confidence
        );
        
      } else {
        setError(data.error || 'Erreur lors de la prédiction');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser la recherche
  const handleNewSearch = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formater le nom du médecin
  const formatDoctorName = (name: string) => {
    return name;
  };

  // Formater le numéro de téléphone
  const formatPhone = (phone: string) => {
    if (!phone || phone === 'Non disponible') return '📞 Non disponible';
    return phone;
  };

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: #eef2f3;
        }

        .search-container {
          min-height: 100vh;
          padding: 20px;
          background: #eef2f3;
        }

        .search-card {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Navbar */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eef2f3;
        }

        .logo {
          font-weight: 700;
          font-size: 22px;
          color: #2f9e95;
          letter-spacing: -0.3px;
        }

        .logo span {
          background: #2f9e95;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          margin-left: 8px;
        }

        .nav-links {
          display: flex;
          gap: 30px;
        }

        .nav-link {
          text-decoration: none;
          color: #666;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.3s ease;
          cursor: pointer;
        }

        .nav-link:hover {
          color: #2f9e95;
        }

        .nav-link.active {
          color: #2f9e95;
          font-weight: 600;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-info {
          text-align: right;
        }

        .user-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }

        .user-info p {
          font-size: 13px;
          color: #666;
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          background: #2f9e95;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          box-shadow: 0 5px 10px rgba(47, 158, 149, 0.2);
          transition: transform 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.1);
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #2f9e95;
          margin-right: 15px;
          transition: transform 0.3s ease;
        }

        .back-btn:hover {
          transform: translateX(-5px);
        }

        .header-section {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-section h1 {
          font-size: 28px;
          font-weight: 600;
          color: #333;
        }

        .search-section {
          margin-bottom: 30px;
        }

        .search-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .search-input {
          flex: 1;
          padding: 15px 20px;
          border: 2px solid #eef2f3;
          border-radius: 15px;
          font-size: 16px;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .search-input:focus {
          outline: none;
          border-color: #2f9e95;
          box-shadow: 0 0 0 3px rgba(47, 158, 149, 0.1);
        }

        .filter-btn {
          padding: 15px 25px;
          background: white;
          border: 2px solid #eef2f3;
          border-radius: 15px;
          font-size: 15px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-btn:hover {
          border-color: #2f9e95;
          color: #2f9e95;
        }

        .filter-btn.active {
          background: #2f9e95;
          color: white;
          border-color: #2f9e95;
        }

        .quick-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .quick-btn {
          padding: 10px 20px;
          background: #f8fbfb;
          border: 2px solid transparent;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #2f9e95;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-btn:hover {
          background: #2f9e95;
          color: white;
        }

        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px 0;
          border-bottom: 2px solid #eef2f3;
        }

        .selected-count {
          font-size: 15px;
          color: #2f9e95;
          font-weight: 600;
        }

        .selected-count span {
          background: #2f9e95;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          margin-left: 8px;
        }

        .symptomes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
          max-height: 500px;
          overflow-y: auto;
          padding: 5px;
          margin-bottom: 30px;
        }

        .symptome-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          background: #f8fbfb;
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .symptome-item:hover {
          border-color: #2f9e95;
          transform: translateX(5px);
        }

        .symptome-item.selected {
          background: #e8f3f2;
          border-color: #2f9e95;
        }

        .symptome-checkbox {
          width: 22px;
          height: 22px;
          margin-right: 12px;
          cursor: pointer;
          accent-color: #2f9e95;
        }

        .symptome-label {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          text-transform: capitalize;
        }

        .no-results {
          text-align: center;
          padding: 40px;
          color: #999;
          font-size: 16px;
        }

        /* Styles pour les résultats */
        .results-section {
          margin-top: 40px;
          padding: 30px;
          background: #f8fbfb;
          border-radius: 30px;
          border: 2px solid #eef2f3;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .results-header h2 {
          font-size: 22px;
          color: #333;
        }

        .new-search-btn {
          padding: 10px 20px;
          background: white;
          border: 2px solid #2f9e95;
          border-radius: 40px;
          color: #2f9e95;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .new-search-btn:hover {
          background: #2f9e95;
          color: white;
        }

        .specialty-card {
          background: white;
          padding: 25px;
          border-radius: 20px;
          margin-bottom: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .specialty-card:hover {
          border-color: #2f9e95;
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.15);
        }

        .specialty-title {
          font-size: 20px;
          color: #333;
          margin-bottom: 15px;
        }

        .specialty-name {
          font-size: 28px;
          font-weight: 700;
          color: #2f9e95;
          margin-bottom: 10px;
        }

        .confidence-badge {
          display: inline-block;
          background: #e8f3f2;
          color: #2f9e95;
          padding: 5px 15px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .disease-name {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }

        .alternatives {
          margin-top: 20px;
          padding: 20px;
          background: #f8fbfb;
          border-radius: 15px;
        }

        .alternatives h4 {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .alternative-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eef2f3;
        }

        .alternative-item:last-child {
          border-bottom: none;
        }

        .alt-disease {
          color: #333;
          font-weight: 500;
        }

        .alt-prob {
          color: #2f9e95;
          font-weight: 600;
        }

        .alt-specialty {
          color: #666;
          font-size: 13px;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .doctor-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.3s ease;
          border-left: 4px solid #2f9e95;
        }

        .doctor-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.15);
        }

        .doctor-name {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
        }

        .doctor-specialty {
          color: #2f9e95;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #eef2f3;
        }

        .doctor-info {
          margin-bottom: 10px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 6px 0;
          color: #555;
          font-size: 14px;
        }

        .info-icon {
          font-size: 16px;
          min-width: 24px;
          color: #2f9e95;
        }

        .info-text {
          flex: 1;
          line-height: 1.4;
        }

        .doctor-location {
          display: inline-block;
          background: #e8f3f2;
          color: #2f9e95;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 5px;
        }

        .appointment-btn {
          width: 100%;
          margin-top: 15px;
          padding: 12px;
          background: #2f9e95;
          color: white;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .appointment-btn:hover {
          background: #267a73;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(47, 158, 149, 0.3);
        }

        .no-doctors {
          text-align: center;
          padding: 40px;
          color: #999;
          font-size: 16px;
          background: #f8fbfb;
          border-radius: 15px;
        }

        .error-message {
          margin-top: 20px;
          padding: 20px;
          background: #fff5f5;
          border: 1px solid #ffcdcd;
          border-radius: 15px;
          color: #dc3545;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f8fbfb;
          border-top-color: #2f9e95;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #eef2f3;
        }

        .cancel-btn {
          padding: 15px 30px;
          background: white;
          border: 2px solid #eef2f3;
          border-radius: 15px;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          border-color: #999;
          color: #333;
        }

        .submit-btn {
          padding: 15px 40px;
          background: #2f9e95;
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(47, 158, 149, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(47, 158, 149, 0.4);
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .footer-note {
          text-align: center;
          color: #999;
          font-size: 13px;
          margin-top: 30px;
        }

        .doctor-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .doctor-city {
          background: #2f9e95;
          color: white;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .search-card {
            padding: 20px;
          }
          
          .search-bar {
            flex-direction: column;
          }
          
          .symptomes-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .doctors-grid {
            grid-template-columns: 1fr;
          }
              font-weight: 700;
          font-size: 22px;
          color: #2f9e95;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 10px;
        }/* ==================== HEADER STYLES COMMUNS ==================== */

/* Navbar styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eef2f3;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0px;  /* ← PLUS AUCUN ESPACE */
  font-weight: 700;
  font-size: 22px;
  color: #2f9e95;
  letter-spacing: -0.3px;
}

.logo img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-right: 0px;  /* ← SUPPRIME TOUT MARGIN */
}

.logo span {
  background: #2f9e95;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  margin-left: 0px;  /* ← SUPPRIME LA MARGE */
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s ease;
  cursor: pointer;
}

.nav-link:hover {
  color: #2f9e95;
}

.nav-link.active {
  color: #2f9e95;
  font-weight: 600;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  text-align: right;
}

.user-info h4 {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.user-info p {
  font-size: 13px;
  color: #666;
}

.user-avatar {
  width: 45px;
  height: 45px;
  background: #2f9e95;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 5px 10px rgba(47, 158, 149, 0.2);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.logout-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  transition: all 0.3s ease;
  padding: 5px;
}

.logout-btn:hover {
  color: #2f9e95;
  transform: translateX(5px);
}

/* Responsive */
@media (max-width: 900px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .nav-links {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .user-info {
    display: none;
  }
}
            
        }
        `}
      </style>

      <div className="search-container">
        <div className="search-card">
          {/* Navigation */}
          <nav className="navbar">
             <div className="logo">
              <img src="./public/logo_app.png" alt="" className="logoapp"/>
           
            
              MyDiagAI <span>Patient</span>
            </div>
            
            <div className="nav-links">
              
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/patient-dashboard'); }}>Dashboard</a>
               <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); navigate('/Recherche'); }}>Recherche</a> 
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Statistics-patient'); }}>Statistiques</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/History-patient'); }}>Historique</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Settings-patient'); }}>Paramètres</a>
            </div>

            <div className="user-profile">
              <div className="user-info">
                <h4>Jade Dupont</h4>
                <p>jade.d@example.com</p>
              </div>
              <div className="user-avatar">JD</div>
            </div>
          </nav>

          {/* Header avec bouton retour */}
          <div className="header-section">
            <button className="back-btn" onClick={() => navigate('/patient-dashboard')}>←</button>
            <h1>Recherche par symptômes</h1>
          </div>

          {/* Barre de recherche */}
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher un symptôme..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button 
                className={`filter-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>🔍</span> Filtres
              </button>
            </div>

            {/* Actions rapides */}
            <div className="quick-actions">
              <button className="quick-btn" onClick={selectAllFiltered}>
                Tout sélectionner
              </button>
              <button className="quick-btn" onClick={deselectAll}>
                Tout désélectionner
              </button>
              <button className="quick-btn" onClick={selectCommonSymptomes}>
                Symptômes courants
              </button>
            </div>

            {/* Statistiques */}
            <div className="stats-bar">
              <div className="selected-count">
                {filteredSymptomes.length} symptôme(s) trouvé(s)
                <span>{selectedCount} sélectionné(s)</span>
              </div>
            </div>

            {/* Grille des symptômes */}
            <div className="symptomes-grid">
              {filteredSymptomes.length > 0 ? (
                filteredSymptomes.map((symptome) => (
                  <div
                    key={symptome}
                    className={`symptome-item ${selectedSymptomes[symptome] ? 'selected' : ''}`}
                    onClick={() => toggleSymptome(symptome)}
                  >
                    <input
                      type="checkbox"
                      className="symptome-checkbox"
                      checked={selectedSymptomes[symptome] || false}
                      onChange={() => toggleSymptome(symptome)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="symptome-label">{symptome}</span>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  Aucun symptôme trouvé pour "{searchTerm}"
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="action-buttons">
              <button className="cancel-btn" onClick={() => navigate('/patient-dashboard')}>
                Annuler
              </button>
              <button 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={selectedCount === 0 || loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Analyse en cours...
                  </>
                ) : (
                  `Rechercher (${selectedCount})`
                )}
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Résultats de la prédiction */}
            {result && result.success && (
              <div className="results-section">
                <div className="results-header">
                  <h2>📋 Résultat de l'analyse</h2>
                  <button className="new-search-btn" onClick={handleNewSearch}>
                    Nouvelle recherche
                  </button>
                </div>

                {/* Carte de la spécialité recommandée */}
                <div className="specialty-card">
                  <div className="specialty-title">Spécialité recommandée</div>
                  <div className="specialty-name">{result.prediction.specialty}</div>
                  <div className="confidence-badge">
                    Confiance: {result.prediction.confidence}%
                  </div>
                  <div className="disease-name">
                    Maladie probable: {result.prediction.disease}
                  </div>

                  {/* Symptômes identifiés */}
                  {result.symptoms_found && result.symptoms_found.length > 0 && (
                    <div style={{ marginTop: '15px', color: '#666' }}>
                      <strong>Symptômes analysés:</strong>{' '}
                      {result.symptoms_found.join(', ')}
                    </div>
                  )}

                  {/* Autres possibilités */}
                  {result.prediction.alternatives && result.prediction.alternatives.length > 0 && (
                    <div className="alternatives">
                      <h4>Autres possibilités:</h4>
                      {result.prediction.alternatives.map((alt, index) => (
                        <div key={index} className="alternative-item">
                          <span className="alt-disease">{alt.maladie}</span>
                          <span>
                            <span className="alt-prob">
                              {Math.round(alt.probabilite * 100)}%
                            </span>
                            <span className="alt-specialty"> ({alt.specialite})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Liste des médecins */}
                <h3 style={{ marginBottom: '20px', color: '#333' }}>
                  👨‍⚕️ Médecins disponibles au Maroc ({result.doctors?.length || 0})
                </h3>

                {result.doctors && result.doctors.length > 0 ? (
                  <div className="doctors-grid">
                    {result.doctors.map((doctor) => (
                      <div key={doctor.id} className="doctor-card">
                        <div className="doctor-badge">
                          <div className="doctor-name">{formatDoctorName(doctor.name)}</div>
                          <div className="doctor-city">{doctor.ville}</div>
                        </div>
                        <div className="doctor-specialty">{doctor.specialite}</div>
                        
                        <div className="doctor-info">
                          <div className="info-item">
                            <span className="info-icon">📍</span>
                            <span className="info-text">{doctor.adresse}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-icon">🏥</span>
                            <span className="info-text">{doctor.clinique}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-icon">📞</span>
                            <span className="info-text">{formatPhone(doctor.telephone)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-icon">✉️</span>
                            <span className="info-text" style={{ fontSize: '13px' }}>{doctor.email}</span>
                          </div>
                        </div>

                        <button className="appointment-btn">
                          Prendre rendez-vous
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-doctors">
                    Aucun médecin disponible pour cette spécialité au Maroc pour le moment.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SymptomeSearch;
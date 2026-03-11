// src/pages/PatientStatistics.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Users, 
  Calendar, 
  ArrowLeft,
  Download,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Building2,
  Award,
  Target,
  PieChart,
  Clock
} from 'lucide-react';

interface SearchStats {
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

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  clinic: string;
  distance?: string;
  rating?: number;
}

const PatientStatistics: React.FC = () => {
  const navigate = useNavigate();
  const [searchStats, setSearchStats] = useState<SearchStats>({
    total_searches: 0,
    average_confidence: 0,
    top_specialties: [],
    recent_searches: []
  });
  
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState<Record<string, Doctor[]>>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les statistiques depuis le localStorage
  useEffect(() => {
    loadStats();
    loadDoctors();
  }, []);

  const loadStats = () => {
    try {
      const saved = localStorage.getItem('patientSearchStats');
      if (saved) {
        setSearchStats(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadDoctors = () => {
    // Simuler le chargement des médecins depuis le localStorage ou une API
    const mockDoctors: Record<string, Doctor[]> = {
      "Cardiologue": [
        { id: 1, name: "Dr Bennani Youssef", specialty: "Cardiologue", address: "45 Boulevard Zerktouni, Casablanca", phone: "0522-123456", email: "bennani.youssef@cardio.ma", city: "Casablanca", clinic: "Clinique Cardiologique", rating: 4.8 },
        { id: 2, name: "Dr Berrada Nadia", specialty: "Cardiologue", address: "12 Rue Oued Bou Regreg, Rabat", phone: "0537-234567", email: "berrada.nadia@cardio.ma", city: "Rabat", clinic: "Centre Cardiologie", rating: 4.6 },
        { id: 3, name: "Dr El Alami Hassan", specialty: "Cardiologue", address: "22 Avenue Mohammed VI, Marrakech", phone: "0524-345678", email: "elalami.hassan@cardio.ma", city: "Marrakech", clinic: "Clinique El Alami", rating: 4.7 }
      ],
      "Pneumologue": [
        { id: 4, name: "Dr Attaq Latifa", specialty: "Pneumologue", address: "15 Rue Mohammed V, Témara", phone: "+212537606052", email: "attaq.latifa@pneumo.ma", city: "Témara", clinic: "Cabinet Attaq", rating: 4.5 },
        { id: 5, name: "Dr El Idrissi Rachid", specialty: "Pneumologue", address: "45 Boulevard Zerktouni, Casablanca", phone: "0522-456789", email: "elidrissi.rachid@pneumo.ma", city: "Casablanca", clinic: "Cabinet El Idrissi", rating: 4.9 }
      ],
      "Psychiatre": [
        { id: 6, name: "Dr Ghazal Najoua", specialty: "Psychiatre", address: "45 Boulevard Zerktouni, Casablanca", phone: "0522-221121", email: "ghazal.najoua@psychiatre.ma", city: "Casablanca", clinic: "Cabinet Ghazal", rating: 4.7 },
        { id: 7, name: "Dr Benani Fatima", specialty: "Psychiatre", address: "12 Rue Allal Ben Abdellah, Rabat", phone: "0537-123456", email: "benani.fatima@psychiatre.ma", city: "Rabat", clinic: "Clinique Benani", rating: 4.5 }
      ],
      "ORL": [
        { id: 8, name: "Dr M'hamed Benjelloun", specialty: "ORL", address: "12 Rue de la Liberté, Tanger", phone: "+2120539943967", email: "benjelloun.mhamed@orl.ma", city: "Tanger", clinic: "Cabinet Benjelloun", rating: 4.6 },
        { id: 9, name: "Dr Mohamed Toubali", specialty: "ORL", address: "8 Avenue Hassan II, Tanger", phone: "+2120539333303", email: "toubali.mohamed@orl.ma", city: "Tanger", clinic: "Clinique Toubali", rating: 4.8 }
      ]
    };
    setDoctorsBySpecialty(mockDoctors);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 70) return '#2f9e95';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      loadStats();
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(searchStats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `statistiques_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

        .stats-container {
          min-height: 100vh;
          padding: 20px;
          background: #eef2f3;
        }

        .stats-card {
          max-width: 1400px;
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

        .header-actions {
          display: flex;
          gap: 15px;
          margin-left: auto;
        }

        .action-btn {
          padding: 10px 20px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-btn {
          background: #f8fbfb;
          border: 2px solid #eef2f3;
          color: #2f9e95;
        }

        .refresh-btn:hover {
          background: #2f9e95;
          color: white;
          border-color: #2f9e95;
        }

        .export-btn {
          background: #2f9e95;
          border: none;
          color: white;
          box-shadow: 0 5px 15px rgba(47, 158, 149, 0.2);
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(47, 158, 149, 0.3);
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .overview-card {
          background: #f8fbfb;
          border-radius: 20px;
          padding: 25px;
          border: 2px solid #eef2f3;
          transition: all 0.3s ease;
        }

        .overview-card:hover {
          transform: translateY(-5px);
          border-color: #2f9e95;
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.1);
        }

        .overview-icon {
          width: 50px;
          height: 50px;
          background: #e8f3f2;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          color: #2f9e95;
        }

        .overview-value {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
        }

        .overview-label {
          color: #666;
          font-size: 14px;
        }

        /* Main Content Layout */
        .main-content {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 25px;
          margin-bottom: 30px;
        }

        /* Left Column - Charts & Stats */
        .left-column {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .stats-card-white {
          background: white;
          border-radius: 20px;
          padding: 25px;
          border: 2px solid #eef2f3;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .specialty-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .specialty-item-large {
          background: #f8fbfb;
          border-radius: 15px;
          padding: 15px;
          border: 2px solid #eef2f3;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .specialty-item-large:hover {
          border-color: #2f9e95;
          transform: translateX(5px);
        }

        .specialty-item-large.selected {
          border-color: #2f9e95;
          background: #e8f3f2;
        }

        .specialty-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .specialty-name-large {
          font-weight: 600;
          color: #333;
        }

        .specialty-count-large {
          background: white;
          color: #2f9e95;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid #eef2f3;
        }

        .progress-container {
          width: 100%;
          height: 8px;
          background: #eef2f3;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .percentage-text {
          font-size: 13px;
          color: #666;
          margin-top: 5px;
          text-align: right;
        }

        /* Recent Searches */
        .recent-searches {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .search-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #f8fbfb;
          border-radius: 12px;
          border: 2px solid #eef2f3;
          transition: all 0.3s ease;
        }

        .search-item:hover {
          border-color: #2f9e95;
        }

        .search-icon {
          width: 40px;
          height: 40px;
          background: #e8f3f2;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #2f9e95;
        }

        .search-content {
          flex: 1;
        }

        .search-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 3px;
        }

        .search-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #666;
        }

        .confidence-badge {
          background: #2f9e95;
          color: white;
          padding: 4px 8px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Right Column - Doctors List */
        .right-column {
          background: #f8fbfb;
          border-radius: 20px;
          padding: 25px;
          border: 2px solid #eef2f3;
          max-height: 800px;
          overflow-y: auto;
        }

        .selected-specialty-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #eef2f3;
        }

        .selected-specialty-header h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 5px;
        }

        .selected-specialty-header p {
          color: #666;
          font-size: 14px;
        }

        .doctors-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .doctor-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          border: 2px solid #eef2f3;
          transition: all 0.3s ease;
        }

        .doctor-card:hover {
          transform: translateY(-3px);
          border-color: #2f9e95;
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.1);
        }

        .doctor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .doctor-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f8fbfb;
          padding: 4px 8px;
          border-radius: 30px;
          color: #f59e0b;
          font-weight: 600;
          font-size: 13px;
        }

        .doctor-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          color: #666;
          font-size: 14px;
        }

        .doctor-detail svg {
          color: #2f9e95;
          min-width: 18px;
        }

        .doctor-clinic {
          background: #f8fbfb;
          padding: 8px 12px;
          border-radius: 10px;
          margin-top: 10px;
          font-size: 13px;
          color: #2f9e95;
          font-weight: 500;
          border: 1px solid #e0ecea;
        }

        .appointment-btn-small {
          width: 100%;
          margin-top: 15px;
          padding: 10px;
          background: #2f9e95;
          color: white;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .appointment-btn-small:hover {
          background: #267a73;
          transform: translateY(-2px);
        }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #999;
          text-align: center;
          gap: 15px;
        }

        .no-selection svg {
          width: 60px;
          height: 60px;
          opacity: 0.3;
        }

        /* Loading spinner */
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f8fbfb;
          border-top-color: #2f9e95;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-card {
            padding: 20px;
          }
          
          .stats-overview {
            grid-template-columns: 1fr;
          }
          
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .header-actions {
            margin-left: 0;
          }
        }
        `}
      </style>

      <div className="stats-container">
        <div className="stats-card">
          {/* Navigation */}
          <nav className="navbar">
            <div className="logo">
              MyDiagAI <span>Patient</span>
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/patient-dashboard'); }}>Dashboard</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Recherche'); }}>Recherche</a>
              <a href="#" className="nav-link active">Statistiques</a>
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

          {/* Header avec bouton retour et actions */}
          <div className="header-section">
            <button className="back-btn" onClick={() => navigate('/patient-dashboard')}>←</button>
            <h1>Statistiques détaillées</h1>
            <div className="header-actions">
              <button className="action-btn refresh-btn" onClick={handleRefresh} disabled={loading}>
                {loading ? <span className="loading-spinner"></span> : <RefreshCw size={16} />}
                Actualiser
              </button>
              <button className="action-btn export-btn" onClick={handleExport}>
                <Download size={16} />
                Exporter
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="overview-card">
              <div className="overview-icon">
                <Activity size={24} />
              </div>
              <div className="overview-value">{searchStats.total_searches}</div>
              <div className="overview-label">Recherches totales</div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">
                <Target size={24} />
              </div>
              <div className="overview-value">{searchStats.average_confidence}%</div>
              <div className="overview-label">Précision moyenne</div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">
                <PieChart size={24} />
              </div>
              <div className="overview-value">{searchStats.top_specialties.length}</div>
              <div className="overview-label">Spécialités consultées</div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">
                <Clock size={24} />
              </div>
              <div className="overview-value">
                {searchStats.recent_searches.length > 0 
                  ? searchStats.recent_searches[0].specialty 
                  : '-'}
              </div>
              <div className="overview-label">Dernière recherche</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Left Column - Charts & Stats */}
            <div className="left-column">
              {/* Top Spécialités */}
              <div className="stats-card-white">
                <div className="card-header">
                  <h3>
                    <TrendingUp size={18} color="#2f9e95" />
                    Top spécialités recherchées
                  </h3>
                  <span style={{ color: '#666', fontSize: '13px' }}>
                    {searchStats.top_specialties.length} spécialité(s)
                  </span>
                </div>

                <div className="specialty-list">
                  {searchStats.top_specialties.length > 0 ? (
                    searchStats.top_specialties.map((item, index) => (
                      <div 
                        key={index} 
                        className={`specialty-item-large ${selectedSpecialty === item.specialty ? 'selected' : ''}`}
                        onClick={() => setSelectedSpecialty(item.specialty)}
                      >
                        <div className="specialty-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%',
                              background: index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] : '#eef2f3',
                              color: index < 3 ? '#333' : '#666',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {index + 1}
                            </span>
                            <span className="specialty-name-large">{item.specialty}</span>
                          </div>
                          <span className="specialty-count-large">{item.count} fois</span>
                        </div>
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: getProgressBarColor(item.percentage)
                            }}
                          />
                        </div>
                        <div className="percentage-text">{Math.round(item.percentage)}% des recherches</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      Aucune statistique disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Recherches récentes */}
              <div className="stats-card-white">
                <div className="card-header">
                  <h3>
                    <Calendar size={18} color="#2f9e95" />
                    Recherches récentes
                  </h3>
                </div>

                <div className="recent-searches">
                  {searchStats.recent_searches.length > 0 ? (
                    searchStats.recent_searches.slice(0, 5).map((search, index) => (
                      <div key={index} className="search-item">
                        <div className="search-icon">
                          <Activity size={20} />
                        </div>
                        <div className="search-content">
                          <div className="search-title">{search.specialty}</div>
                          <div className="search-meta">
                            <span>{search.disease}</span>
                            <span>{formatDate(search.date)}</span>
                          </div>
                        </div>
                        <div className="confidence-badge">{search.confidence}%</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      Aucune recherche récente
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Doctors List */}
            <div className="right-column">
              {selectedSpecialty ? (
                <>
                  <div className="selected-specialty-header">
                    <h3>{selectedSpecialty}</h3>
                    <p>Médecins disponibles dans cette spécialité</p>
                  </div>

                  <div className="doctors-list">
                    {doctorsBySpecialty[selectedSpecialty]?.map((doctor) => (
                      <div key={doctor.id} className="doctor-card">
                        <div className="doctor-header">
                          <span className="doctor-name">{doctor.name}</span>
                          {doctor.rating && (
                            <span className="doctor-rating">
                              <span>⭐</span> {doctor.rating}
                            </span>
                          )}
                        </div>
                        
                        <div className="doctor-detail">
                          <MapPin size={16} />
                          <span>{doctor.address}</span>
                        </div>
                        
                        <div className="doctor-detail">
                          <Phone size={16} />
                          <span>{doctor.phone}</span>
                        </div>
                        
                        <div className="doctor-detail">
                          <Mail size={16} />
                          <span>{doctor.email}</span>
                        </div>

                        <div className="doctor-clinic">
                          <Building2 size={14} style={{ marginRight: '6px' }} />
                          {doctor.clinic} • {doctor.city}
                        </div>

                        <button className="appointment-btn-small">
                          Prendre rendez-vous
                        </button>
                      </div>
                    ))}

                    {(!doctorsBySpecialty[selectedSpecialty] || doctorsBySpecialty[selectedSpecialty].length === 0) && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Aucun médecin trouvé pour cette spécialité
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <BarChart3 size={60} />
                  <h3>Sélectionnez une spécialité</h3>
                  <p>Cliquez sur une spécialité dans la liste de gauche pour voir les médecins disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            fontSize: '13px', 
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '2px solid #eef2f3'
          }}>
            ⏱️ Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientStatistics;
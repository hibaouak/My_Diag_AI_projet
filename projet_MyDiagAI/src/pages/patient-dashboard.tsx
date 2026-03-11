//src/pages/patient-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DoctorSearch {
  id: number;
  initials: string;
  name: string;
  specialty: string;
  distance: string;
  clinic: string;
  timeAgo: string;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  avatar: string;
}

interface Stats {
  consultations: number;
  consultationsThisMonth: number;
  doctorsContacted: number;
  activeDoctors: number;
  satisfaction: number;
  totalReviews: number;
  lastDoctor: string;
  lastDiagnostic: string;
}

// Interface pour les statistiques de recherche
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

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<SearchStats>({
    total_searches: 0,
    top_specialties: [],
    average_confidence: 0,
    recent_searches: []
  });
  
  const [user] = useState<UserInfo>({
    firstName: 'Jade',
    lastName: 'Dupont',
    email: 'jade.d@example.com',
    location: 'Antibes, 06',
    avatar: 'JD'
  });

  // Charger les statistiques depuis le localStorage
  useEffect(() => {
    loadSearchStats();
  }, []);

  const loadSearchStats = () => {
    try {
      const saved = localStorage.getItem('patientSearchStats');
      if (saved) {
        setSearchStats(JSON.parse(saved));
      } else {
        // Stats par défaut
        const defaultStats = {
          total_searches: 0,
          top_specialties: [],
          average_confidence: 0,
          recent_searches: []
        };
        setSearchStats(defaultStats);
        localStorage.setItem('patientSearchStats', JSON.stringify(defaultStats));
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const [recentSearches] = useState<DoctorSearch[]>([
    {
      id: 1,
      initials: 'IM',
      name: 'Dr Imrab',
      specialty: 'Cardiologue',
      distance: '2,3 km',
      clinic: 'Centre Azur',
      timeAgo: 'Il y a 15h'
    },
    {
      id: 2,
      initials: 'MY',
      name: 'Dr meryem',
      specialty: 'Généraliste',
      distance: '1,5 km',
      clinic: 'Cabinet Wilson',
      timeAgo: 'Il y a 18h'
    }
  ]);

  const [stats] = useState<Stats>({
    consultations: 25,
    consultationsThisMonth: 5,
    doctorsContacted: 15,
    activeDoctors: 5,
    satisfaction: 34,
    totalReviews: 25,
    lastDoctor: 'Imrab',
    lastDiagnostic: 'Imrab'
  });

  const handleNewSearch = () => {
    console.log('Nouvelle recherche');
    navigate('/Recherche');
  };

  const handleViewStats = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Voir les statistiques');
    navigate('/Statistics-patient');
  };

  const handleRefresh = () => {
    console.log('Actualiser les données');
    window.location.reload();
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleResetStats = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes vos statistiques de recherche ?')) {
      const defaultStats = {
        total_searches: 0,
        top_specialties: [],
        average_confidence: 0,
        recent_searches: []
      };
      setSearchStats(defaultStats);
      localStorage.setItem('patientSearchStats', JSON.stringify(defaultStats));
    }
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

        .dashboard-container {
          min-height: 100vh;
          padding: 20px;
          background: #eef2f3;
        }

        .dashboard-card {
          max-width: 1280px;
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

        /* Navbar styles */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #eef2f3;
          padding-bottom: 20px;
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

        /* Greeting section */
        .greeting-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .greeting h1 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .greeting p {
          color: #666;
          margin-top: 5px;
          font-size: 15px;
        }

        .greeting strong {
          color: #2f9e95;
          font-weight: 600;
        }

        .assistant-text {
          color: #666;
          font-size: 14px;
          margin-top: 8px;
        }

        .new-diagnostic-btn {
          background: #2f9e95;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.3);
          border: 2px solid transparent;
        }

        .new-diagnostic-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.4);
        }

        .new-diagnostic-btn span {
          font-size: 20px;
          font-weight: 400;
        }

        .view-stats-link {
          color: #2f9e95;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          margin-left: 15px;
          transition: color 0.3s ease;
        }

        .view-stats-link:hover {
          color: #1e6b64;
          text-decoration: underline;
        }

        /* Search Stats Section - MODIFIÉ EN BLANC */
        .search-stats-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 2px solid #eef2f3;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .stats-header h2 {
          font-size: 22px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reset-stats-btn {
          background: #f8fbfb;
          border: 2px solid #eef2f3;
          color: #2f9e95;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
        }

        .reset-stats-btn:hover {
          background: #2f9e95;
          color: white;
          border-color: #2f9e95;
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 25px;
        }

        .stat-item {
          background: #f8fbfb;
          border-radius: 15px;
          padding: 25px 20px;
          text-align: center;
          border: 2px solid #eef2f3;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
          border-color: #2f9e95;
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.1);
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #2f9e95;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .top-specialties {
          background: #f8fbfb;
          border-radius: 15px;
          padding: 20px;
          border: 2px solid #eef2f3;
        }

        .top-specialties h3 {
          font-size: 18px;
          color: #333;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .specialty-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eef2f3;
        }

        .specialty-item:last-child {
          border-bottom: none;
        }

        .specialty-name {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .specialty-rank {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        .rank-1 {
          background: #ffd700;
          color: #333;
        }

        .rank-2 {
          background: #c0c0c0;
          color: #333;
        }

        .rank-3 {
          background: #cd7f32;
          color: #333;
        }

        .rank-other {
          background: #eef2f3;
          color: #666;
        }

        .specialty-count {
          background: white;
          color: #2f9e95;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid #eef2f3;
        }

        /* Stats grid original */
        .original-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: #2f9e95;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.15);
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .stat-detail {
          font-size: 13px;
          color: #2f9e95;
          border-top: 1px solid #eef2f3;
          padding-top: 10px;
        }

        .stat-detail.gray {
          color: #999;
        }

        .stat-last {
          font-size: 13px;
          color: #2f9e95;
          margin-top: 5px;
          font-weight: 500;
        }

        /* Two columns layout */
        .two-columns {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
          margin-top: 20px;
        }

        .recent-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .recent-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.1);
        }

        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .recent-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .recent-header a {
          color: #2f9e95;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .recent-header a:hover {
          color: #1e6b64;
        }

        .doctor-item {
          display: flex;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eef2f3;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .doctor-item:last-child {
          border-bottom: none;
        }

        .doctor-item:hover {
          background: #f8fbfb;
          padding-left: 10px;
          border-radius: 10px;
        }

        .doctor-avatar {
          width: 45px;
          height: 45px;
          background: #e8f3f2;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          color: #2f9e95;
          margin-right: 15px;
        }

        .doctor-info {
          flex: 1;
        }

        .doctor-info h4 {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .doctor-info p {
          color: #999;
          font-size: 13px;
          margin-top: 2px;
        }

        .doctor-time {
          font-size: 12px;
          color: #999;
        }

        .actions-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .actions-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.1);
        }

        .actions-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          background: #f8fbfb;
          padding: 15px 20px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          color: #333;
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-size: 15px;
        }

        .action-btn:hover {
          transform: translateX(5px);
          border-color: #2f9e95;
          background: white;
        }

        .action-btn.primary {
          background: #2f9e95;
          color: white;
        }

        .action-btn.primary:hover {
          background: #267a73;
          transform: translateX(5px);
        }

        .action-icon {
          font-size: 20px;
        }

        hr {
          border: none;
          border-top: 2px solid #eef2f3;
          margin: 25px 0 15px;
        }

        .tip-card {
          margin-top: 15px;
          background: #f8fbfb;
          padding: 15px;
          border-radius: 15px;
          border: 1px solid #e0ecea;
        }

        .tip-title {
          font-weight: 600;
          color: #2f9e95;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .tip-text {
          font-size: 13px;
          color: #666;
        }

        .footer-note {
          text-align: center;
          color: #999;
          font-size: 13px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eef2f3;
        }

        @media (max-width: 900px) {
          .navbar {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .nav-links {
            flex-wrap: wrap;
          }
          
          .stats-grid,
          .original-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .two-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .dashboard-card {
            padding: 20px;
          }
          
          .stats-grid,
          .original-stats-grid {
            grid-template-columns: 1fr;
          }
          
          .greeting-section {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .logoapp {
          width: 250px;
          height: 250px;
          margin-right: 10px;
          margin-bottom: -70px;
        }
        `}
      </style>

      <div className="dashboard-container">
        <div className="dashboard-card">
          {/* Navigation */}
          <nav className="navbar">
            <div className="logo">
              <img src="./public/logo_app.png" alt="" className="logoapp"/>
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link active">Dashboard</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Recherche'); }}>Recherche</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Statistics-patient'); }}>Statistiques</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/History-patient'); }}>Historique</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Settings-patient'); }}>Paramètres</a>
            </div>

            <div className="user-profile">
              <div className="user-info">
                <h4>Bonjour, {user.firstName}</h4>
                <p>{user.email}</p>
              </div>
              <div className="user-avatar">{user.avatar}</div>
              <button onClick={handleLogout} className="logout-btn" title="Déconnexion">↪</button>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {/* Greeting Section */}
            <div className="greeting-section">
              <div className="greeting">
                <h1>Bonjour, {user.firstName} {user.lastName}</h1>
                <p>
                  <strong>Patient</strong> {user.email}
                </p>
                <p className="assistant-text">
                  Assistant intelligent pour la recherche de médecins
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                  className="new-diagnostic-btn" 
                  onClick={handleNewSearch}
                >
                  <span>+</span> Nouvelle recherche
                </button>
                <a href="#" className="view-stats-link" onClick={handleViewStats}>
                  Voir les statistiques
                </a>
              </div>
            </div>

            {/* SECTION STATISTIQUES DE RECHERCHE - DESIGN BLANC */}
            <div className="search-stats-section">
              <div className="stats-header">
                <h2>
                  <span>📊</span> Vos statistiques de recherche
                </h2>
                <button className="reset-stats-btn" onClick={handleResetStats}>
                  <span>🔄</span> Réinitialiser
                </button>
              </div>

              <div className="stats-grid">
                {/* Nombre total de recherches */}
                <div className="stat-item">
                  <div className="stat-value">{searchStats.total_searches}</div>
                  <div className="stat-label">Recherches totales</div>
                </div>

                {/* Précision moyenne */}
                <div className="stat-item">
                  <div className="stat-value">{searchStats.average_confidence}%</div>
                  <div className="stat-label">Précision moyenne</div>
                </div>

                {/* Spécialités différentes */}
                <div className="stat-item">
                  <div className="stat-value">{searchStats.top_specialties.length}</div>
                  <div className="stat-label">Spécialités consultées</div>
                </div>

                {/* Dernière recherche */}
                <div className="stat-item">
                  <div className="stat-value">
                    {searchStats.recent_searches.length > 0 
                      ? searchStats.recent_searches[0].specialty 
                      : '-'}
                  </div>
                  <div className="stat-label">Dernière recherche</div>
                </div>
              </div>

              {/* Top spécialités */}
              {searchStats.top_specialties.length > 0 && (
                <div className="top-specialties">
                  <h3>
                    <span>🏆</span> Top spécialités recherchées
                  </h3>
                  <div>
                    {searchStats.top_specialties.map((item, index) => (
                      <div key={index} className="specialty-item">
                        <div className="specialty-name">
                          <span className={`specialty-rank rank-${index < 3 ? index + 1 : 'other'}`}>
                            {index + 1}
                          </span>
                          <span style={{ color: '#333', fontWeight: 500 }}>{item.specialty}</span>
                        </div>
                        <div className="specialty-count">
                          {item.count} ({Math.round(item.percentage)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Two Columns Section */}
            <div className="two-columns">
              {/* Recent Searches */}
              <div className="recent-card">
                <div className="recent-header">
                  <h3>Recherches récentes</h3>
                  <a href="#" onClick={handleViewStats}>Voir tout</a>
                </div>

                {recentSearches.map((doctor) => (
                  <div key={doctor.id} className="doctor-item">
                    <div className="doctor-avatar">{doctor.initials}</div>
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialty} • {doctor.clinic}</p>
                    </div>
                    <div className="doctor-time">{doctor.timeAgo}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="actions-card">
                <h3>Actions rapides</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn primary"
                    onClick={handleNewSearch}
                  >
                    <span className="action-icon">+</span> Nouvelle recherche
                  </button>

                  <button 
                    className="action-btn"
                    onClick={() => navigate('/statistiques-patient')}
                  >
                    <span className="action-icon">📊</span> Statistiques détaillées
                  </button>

                  <button 
                    className="action-btn"
                    onClick={handleRefresh}
                  >
                    <span className="action-icon">🔄</span> Actualiser les données
                  </button>
                </div>

                <hr />
                
                <div className="tip-card">
                  <p className="tip-title">📍 Astuce</p>
                  <p className="tip-text">
                    Activez la géolocalisation pour trouver des médecins autour de vous
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="footer-note">
              ⏱️ Dernière mise à jour : il y a 10 minutes
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
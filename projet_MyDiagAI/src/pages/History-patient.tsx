// src/pages/PatientHistory.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ArrowLeft,
  Clock,
  Activity,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

interface SearchHistory {
  id: string;
  specialty: string;
  disease: string;
  confidence: number;
  date: string;
  symptoms: string[];
  doctors?: any[];
}

const PatientHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearch, setSelectedSearch] = useState<SearchHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Filtres
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    averageConfidence: 0,
    topSpecialty: '',
    lastSearch: ''
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, dateFilter, specialtyFilter, searchTerm]);

  const loadHistory = () => {
    setLoading(true);
    try {
      // Charger depuis le localStorage
      const saved = localStorage.getItem('patientSearchStats');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Transformer en historique
        const searches = data.recent_searches?.map((s: any, index: number) => ({
          id: `search-${index}-${Date.now()}`,
          specialty: s.specialty,
          disease: s.disease,
          confidence: s.confidence,
          date: s.date,
          symptoms: s.symptoms || ['Symptômes non spécifiés']
        })) || [];
        
        setHistory(searches);
        
        // Calculer les stats
        const total = searches.length;
        const avgConf = total > 0 
          ? Math.round(searches.reduce((acc, s) => acc + s.confidence, 0) / total) 
          : 0;
        const topSpec = getMostFrequentSpecialty(searches);
        const lastSearch = searches[0]?.specialty || '-';
        
        setStats({
          total,
          averageConfidence: avgConf,
          topSpecialty: topSpec,
          lastSearch
        });
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMostFrequentSpecialty = (searches: SearchHistory[]) => {
    const counts: Record<string, number> = {};
    searches.forEach(s => {
      counts[s.specialty] = (counts[s.specialty] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostFrequent = '';
    Object.entries(counts).forEach(([spec, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = spec;
      }
    });
    return mostFrequent || '-';
  };

  const applyFilters = () => {
    let filtered = [...history];
    
    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      if (dateFilter === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
      } else if (dateFilter === 'year') {
        cutoff.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(s => new Date(s.date) >= cutoff);
    }
    
    // Filtre par spécialité
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(s => s.specialty === specialtyFilter);
    }
    
    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.specialty.toLowerCase().includes(term) ||
        s.disease.toLowerCase().includes(term)
      );
    }
    
    setFilteredHistory(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setDateFilter('all');
    setSpecialtyFilter('all');
    setSearchTerm('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#2f9e95';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getUniqueSpecialties = () => {
    const specialties = [...new Set(history.map(s => s.specialty))];
    return ['all', ...specialties];
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handleViewDetails = (search: SearchHistory) => {
    setSelectedSearch(search);
    setShowDetails(true);
  };

  const handleRedoSearch = (search: SearchHistory) => {
    // Naviguer vers la recherche avec les symptômes
    navigate('/Recherche', { 
      state: { preselectedSymptoms: search.symptoms }
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="stats-container">
        <div className="stats-card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #eef2f3',
            borderTopColor: '#2f9e95',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#666' }}>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

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
          gap: 5px;
          font-weight: 700;
          font-size: 22px;
          color: #2f9e95;
          letter-spacing: -0.3px;
        }

        .logo img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .logo span {
          background: #2f9e95;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          margin-left: 5px;
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

        .nav-link:hover,
        .nav-link.active {
          color: #2f9e95;
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
        }

        .export-btn {
          background: #2f9e95;
          border: none;
          color: white;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(47, 158, 149, 0.3);
        }

        /* Stats rapides */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-box {
          background: #f8fbfb;
          border-radius: 15px;
          padding: 20px;
          border: 2px solid #eef2f3;
        }

        .stat-label {
          color: #666;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #2f9e95;
        }

        /* Filtres */
        .filters-section {
          background: #f8fbfb;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          border: 2px solid #eef2f3;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: center;
        }

        .search-box {
          flex: 2;
          min-width: 250px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 12px 15px 12px 40px;
          border: 2px solid #eef2f3;
          border-radius: 40px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #2f9e95;
        }

        .search-box svg {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .filter-select {
          flex: 1;
          min-width: 150px;
          padding: 12px 15px;
          border: 2px solid #eef2f3;
          border-radius: 40px;
          font-size: 14px;
          color: #333;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #2f9e95;
        }

        .reset-filters {
          background: white;
          border: 2px solid #eef2f3;
          border-radius: 40px;
          padding: 10px 20px;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
        }

        .reset-filters:hover {
          border-color: #2f9e95;
          color: #2f9e95;
        }

        /* Timeline */
        .timeline {
          position: relative;
          margin-bottom: 30px;
        }

        .timeline-item {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: #f8fbfb;
          border-radius: 15px;
          margin-bottom: 15px;
          border: 2px solid #eef2f3;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .timeline-item:hover {
          transform: translateX(5px);
          border-color: #2f9e95;
        }

        .timeline-time {
          min-width: 100px;
          text-align: center;
        }

        .timeline-date {
          font-weight: 600;
          color: #2f9e95;
          font-size: 14px;
        }

        .timeline-hour {
          color: #999;
          font-size: 12px;
          margin-top: 2px;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .timeline-subtitle {
          color: #666;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .confidence-bar {
          width: 100%;
          height: 6px;
          background: #eef2f3;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .confidence-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .timeline-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .symptoms-tags {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .symptom-tag {
          background: white;
          padding: 4px 8px;
          border-radius: 30px;
          font-size: 11px;
          color: #666;
          border: 1px solid #eef2f3;
        }

        .action-icons {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          border: 2px solid #eef2f3;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
        }

        .icon-btn:hover {
          border-color: #2f9e95;
          color: #2f9e95;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 30px;
        }

        .page-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #eef2f3;
          background: white;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #2f9e95;
          color: #2f9e95;
        }

        .page-btn.active {
          background: #2f9e95;
          border-color: #2f9e95;
          color: white;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-info {
          color: #666;
          font-size: 14px;
        }

        /* Modal détails */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 30px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          transition: color 0.3s ease;
        }

        .modal-close:hover {
          color: #2f9e95;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #2f9e95;
          margin-bottom: 20px;
        }

        .detail-row {
          padding: 12px 0;
          border-bottom: 1px solid #eef2f3;
        }

        .detail-label {
          color: #666;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .detail-value {
          color: #333;
          font-weight: 600;
          font-size: 16px;
        }

        .modal-buttons {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }

        .modal-btn {
          flex: 1;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .modal-btn.primary {
          background: #2f9e95;
          color: white;
        }

        .modal-btn.primary:hover {
          background: #267a73;
        }

        .modal-btn.secondary {
          background: #f8fbfb;
          border: 2px solid #eef2f3;
          color: #666;
        }

        .modal-btn.secondary:hover {
          border-color: #2f9e95;
          color: #2f9e95;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .empty-state svg {
          width: 60px;
          height: 60px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .empty-state h3 {
          color: #333;
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .stats-card {
            padding: 20px;
          }

          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .timeline-item {
            flex-direction: column;
            gap: 10px;
          }

          .timeline-time {
            text-align: left;
          }
        }
      `}</style>

      <div className="stats-container">
        <div className="stats-card">
          {/* Navigation */}
          <nav className="navbar">
            <div className="logo">
              <img src="./public/logo_app.png" alt="" className="logoapp"/>
              MyDiagAI <span>Patient</span>
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/patient-dashboard'); }}>Dashboard</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Recherche'); }}>Recherche</a>
               <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/statistics-patient'); }}>Statistiques</a>
              <a href="#" className="nav-link active">Historique</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Settings-patient'); }}>Paramètres</a>
            </div>

            <div className="user-profile">
              <div className="user-info">
                <h4>Rym Rabati</h4>
                <p>rymrabati@gmail.com</p>
              </div>
              <div className="user-avatar">JD</div>
            </div>
          </nav>

          {/* Header */}
          <div className="header-section">
            <button className="back-btn" onClick={() => navigate('/patient-dashboard')}>←</button>
            <h1>Historique des recherches</h1>
            <div className="header-actions">
              <button className="action-btn refresh-btn" onClick={loadHistory}>
                <RefreshCw size={16} />
                Actualiser
              </button>
              
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="quick-stats">
            <div className="stat-box">
              <div className="stat-label">Total recherches</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Confiance moyenne</div>
              <div className="stat-value">{stats.averageConfidence}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Top spécialité</div>
              <div className="stat-value">{stats.topSpecialty}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Dernière</div>
              <div className="stat-value">{stats.lastSearch}</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="filters-section">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Rechercher par spécialité ou maladie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="all">Toutes les dates</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>

            <select
              className="filter-select"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">Toutes spécialités</option>
              {getUniqueSpecialties().filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button className="reset-filters" onClick={resetFilters}>
              <X size={14} /> Réinitialiser
            </button>
          </div>

          {/* Timeline */}
          <div className="timeline">
            {currentItems.length > 0 ? (
              currentItems.map((search) => (
                <div
                  key={search.id}
                  className="timeline-item"
                  onClick={() => handleViewDetails(search)}
                >
                  <div className="timeline-time">
                    <div className="timeline-date">{formatDate(search.date)}</div>
                    <div className="timeline-hour">{formatTime(search.date)}</div>
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-title">{search.specialty}</div>
                    <div className="timeline-subtitle">{search.disease}</div>

                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${search.confidence}%`,
                          backgroundColor: getConfidenceColor(search.confidence)
                        }}
                      />
                    </div>

                    <div className="timeline-footer">
                      <div className="symptoms-tags">
                        {search.symptoms.slice(0, 3).map((symptom, i) => (
                          <span key={i} className="symptom-tag">{symptom}</span>
                        ))}
                        {search.symptoms.length > 3 && (
                          <span className="symptom-tag">+{search.symptoms.length - 3}</span>
                        )}
                      </div>

                      <div className="action-icons">
                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(search);
                          }}
                          title="Voir détails"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRedoSearch(search);
                          }}
                          title="Refaire cette recherche"
                        >
                          <Activity size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Calendar size={60} />
                <h3>Aucune recherche trouvée</h3>
                <p>
                  {history.length === 0
                    ? "Vous n'avez pas encore effectué de recherche"
                    : "Aucune recherche ne correspond à vos filtres"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="page-info">...</span>;
                }
                return null;
              })}

              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal détails */}
      {showDetails && selectedSearch && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            
            <h2 className="modal-title">Détails de la recherche</h2>

            <div className="detail-row">
              <div className="detail-label">Date et heure</div>
              <div className="detail-value">
                {new Date(selectedSearch.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Spécialité recommandée</div>
              <div className="detail-value">{selectedSearch.specialty}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Maladie probable</div>
              <div className="detail-value">{selectedSearch.disease}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Niveau de confiance</div>
              <div className="detail-value">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{selectedSearch.confidence}%</span>
                  <div style={{ flex: 1, height: '8px', background: '#eef2f3', borderRadius: '4px' }}>
                    <div
                      style={{
                        width: `${selectedSearch.confidence}%`,
                        height: '100%',
                        backgroundColor: getConfidenceColor(selectedSearch.confidence),
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Symptômes analysés</div>
              <div className="detail-value">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                  {selectedSearch.symptoms.map((symptom, i) => (
                    <span key={i} style={{
                      background: '#e8f3f2',
                      color: '#2f9e95',
                      padding: '4px 10px',
                      borderRadius: '30px',
                      fontSize: '12px'
                    }}>
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="modal-btn secondary"
                onClick={() => {
                  setShowDetails(false);
                  navigate('/statistics-patient');
                }}
              >
                Voir statistiques
              </button>
              <button
                className="modal-btn primary"
                onClick={() => {
                  setShowDetails(false);
                  handleRedoSearch(selectedSearch);
                }}
              >
                Nouvelle recherche
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientHistory;
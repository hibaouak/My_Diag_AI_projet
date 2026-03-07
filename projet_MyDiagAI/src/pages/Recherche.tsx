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
].sort(); // Tri alphabétique pour meilleure lisibilité

interface SymptomeState {
  [key: string]: boolean;
}

const SymptomeSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptomes, setSelectedSymptomes] = useState<SymptomeState>({});
  const [filteredSymptomes, setFilteredSymptomes] = useState(SYMPTOMES);
  const [showFilters, setShowFilters] = useState(false);

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
  };

  // Sélectionner tous les symptômes filtrés
  const selectAllFiltered = () => {
    const newSelected = { ...selectedSymptomes };
    filteredSymptomes.forEach(symptome => {
      newSelected[symptome] = true;
    });
    setSelectedSymptomes(newSelected);
  };

  // Désélectionner tous les symptômes
  const deselectAll = () => {
    setSelectedSymptomes({});
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
  };

  // Compter le nombre de symptômes sélectionnés
  const selectedCount = Object.values(selectedSymptomes).filter(Boolean).length;

  // Soumettre la recherche
  const handleSubmit = () => {
    const selectedList = Object.entries(selectedSymptomes)
      .filter(([_, selected]) => selected)
      .map(([symptome]) => symptome);
    
    console.log('Symptômes sélectionnés:', selectedList);
    
    // Ici vous pouvez envoyer les symptômes à votre API
    // navigate('/resultats', { state: { symptomes: selectedList } });
    
    // Pour l'instant on affiche une alerte
    alert(`Recherche avec ${selectedCount} symptôme(s) :\n${selectedList.join(', ')}`);
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
          max-width: 1000px;
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

        @media (max-width: 600px) {
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
        }
        `}
      </style>

      <div className="search-container">
        <div className="search-card">
          {/* Navigation */}
          <nav className="navbar">
            <div className="logo">
              MyDiagAI <span>Patient</span>
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/patient-dashboard'); }}>Dashboard</a>
              <a href="#" className="nav-link active">Recherche</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/mes-favoris'); }}>Mes médecins</a>
              
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
                disabled={selectedCount === 0}
              >
                Rechercher ({selectedCount})
              </button>
            </div>

            {/* Note de pied de page */}
            <div className="footer-note">
              Sélectionnez vos symptômes pour obtenir des recommandations de médecins
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SymptomeSearch;
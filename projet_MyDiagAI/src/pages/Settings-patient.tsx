import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  avatar: string;
}

const PatientSettings: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'clair' | 'sombre'>('clair');
  
  const [user] = useState<UserInfo>({
    firstName: 'Jade',
    lastName: 'Dupont',
    email: 'jade.d@example.com',
    location: 'Antibes, 06',
    avatar: 'JD'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    rappels: true,
    promotions: false
  });

  const handleLogout = () => {
    navigate('/');
  };

  const handleSaveSettings = () => {
    console.log('Paramètres sauvegardés', { theme, notifications });
    // Ici vous pouvez ajouter la logique pour sauvegarder les paramètres
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
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo span {
          background: #2f9e95;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          margin-left: 8px;
        }

        .logoapp {
          width: 40px;
          height: 40px;
          object-fit: contain;
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

        /* Settings Header */
        .settings-header {
          margin-bottom: 40px;
        }

        .settings-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 10px;
        }

        .settings-header p {
          color: #666;
          font-size: 16px;
        }

        /* Settings Grid */
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-bottom: 30px;
        }

        .settings-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .settings-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.1);
        }

        .settings-card h2 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }

        .settings-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        /* Theme Toggle */
        .theme-section {
          margin-bottom: 30px;
        }

        .theme-description {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .theme-description p {
          color: #666;
          font-size: 14px;
        }

        .theme-buttons {
          display: flex;
          gap: 10px;
        }

        .theme-btn {
          padding: 8px 20px;
          border-radius: 30px;
          border: 2px solid #2f9e95;
          background: transparent;
          color: #2f9e95;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-btn.active {
          background: #2f9e95;
          color: white;
        }

        .theme-btn:hover {
          background: #2f9e95;
          color: white;
        }

        /* Notification Items */
        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eef2f3;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .notification-info p {
          color: #999;
          font-size: 13px;
        }

        /* Toggle Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #2f9e95;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        /* Language Selector */
        .language-selector {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #eef2f3;
          border-radius: 15px;
          font-size: 15px;
          color: #333;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .language-selector:hover {
          border-color: #2f9e95;
        }

        .language-selector:focus {
          outline: none;
          border-color: #2f9e95;
        }

        /* Profile Section */
        .profile-info {
          background: #f8fbfb;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
        }

        .profile-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e0ecea;
        }

        .profile-row:last-child {
          border-bottom: none;
        }

        .profile-label {
          font-weight: 500;
          color: #666;
        }

        .profile-value {
          color: #333;
          font-weight: 600;
        }

        .edit-profile-btn {
          background: transparent;
          border: 2px solid #2f9e95;
          color: #2f9e95;
          padding: 10px 20px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .edit-profile-btn:hover {
          background: #2f9e95;
          color: white;
        }

        /* Danger Zone */
        .danger-zone {
          margin-top: 30px;
          padding: 20px;
          background: #fff5f5;
          border-radius: 15px;
          border: 1px solid #ffcdcd;
        }

        .danger-zone h3 {
          color: #dc3545;
          margin-bottom: 10px;
        }

        .danger-zone p {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .delete-btn {
          background: transparent;
          border: 2px solid #dc3545;
          color: #dc3545;
          padding: 10px 20px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background: #dc3545;
          color: white;
        }

        /* Save Button */
        .save-section {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eef2f3;
        }

        .save-btn {
          background: #2f9e95;
          color: white;
          border: none;
          padding: 12px 40px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.3);
        }

        .save-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.4);
        }

        .cancel-btn {
          background: transparent;
          border: 2px solid #999;
          color: #666;
          padding: 12px 30px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          border-color: #2f9e95;
          color: #2f9e95;
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
          
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .dashboard-card {
            padding: 20px;
          }
          
          .save-section {
            flex-direction: column;
          }
          
          .save-btn, .cancel-btn {
            width: 100%;
          }
        }
        `}
      </style>

      <div className="dashboard-container">
        <div className="dashboard-card">
          {/* Navigation */}
          <nav className="navbar">
            <div className="logo">
              <img src="/logo_app.png" alt="MyDiagAI" className="logoapp"/>
              MyDiagAI
              <span>Patient</span>
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/patient-dashboard'); }}>Dashboard</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/Recherche'); }}>Recherche</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/statistics-patient'); }}>Statistiques</a>
               <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/History-patient'); }}>Historique</a>
              <a href="#" className="nav-link active">Paramètres</a>
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
            {/* Settings Header */}
            <div className="settings-header">
              <h1>Paramètres</h1>
              <p>Personnalisez votre expérience MyDiagAI</p>
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
              {/* Apparence Card */}
              <div className="settings-card">
                <h2>Apparence</h2>
                
                <div className="theme-section">
                  <h3>Choisissez le thème de l'application</h3>
                  <div className="theme-description">
                    <p>Mode sombre</p>
                    <p style={{ color: '#999', fontSize: '13px' }}>Activer le thème sombre pour réduire la fatigue oculaire</p>
                  </div>
                  
                  <div className="theme-buttons">
                    <button 
                      className={`theme-btn ${theme === 'clair' ? 'active' : ''}`}
                      onClick={() => setTheme('clair')}
                    >
                      Clair
                    </button>
                    <button 
                      className={`theme-btn ${theme === 'sombre' ? 'active' : ''}`}
                      onClick={() => setTheme('sombre')}
                    >
                      Sombre
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <h3>Langue</h3>
                  <select className="language-selector" defaultValue="fr">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="settings-card">
                <h2>Notifications</h2>
                
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Notifications par email</h4>
                    <p>Recevoir des alertes par email</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Rappels de rendez-vous</h4>
                    <p>Notifications pour vos rendez-vous</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.rappels}
                      onChange={(e) => setNotifications({...notifications, rappels: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Offres et promotions</h4>
                    <p>Recevoir des offres spéciales</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.promotions}
                      onChange={(e) => setNotifications({...notifications, promotions: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Informations personnelles Card */}
              <div className="settings-card">
                <h2>Informations personnelles</h2>
                
                <div className="profile-info">
                  <div className="profile-row">
                    <span className="profile-label">Nom complet</span>
                    <span className="profile-value">{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{user.email}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Localisation</span>
                    <span className="profile-value">{user.location}</span>
                  </div>
                </div>

                <button className="edit-profile-btn">
                  Modifier le profil
                </button>
              </div>

              {/* Confidentialité Card */}
              <div className="settings-card">
                <h2>Confidentialité</h2>
                
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Partager mes données</h4>
                    <p>Permettre le partage anonyme pour améliorer les recommandations</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Géolocalisation</h4>
                    <p>Activer pour trouver des médecins près de chez vous</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                  <h3>Zone dangereuse</h3>
                  <p>Supprimer définitivement votre compte et toutes vos données</p>
                  <button className="delete-btn">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="save-section">
              <button className="cancel-btn" onClick={() => navigate('/patient-dashboard')}>
                Annuler
              </button>
              <button className="save-btn" onClick={handleSaveSettings}>
                Sauvegarder
              </button>
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

export default PatientSettings;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '500+', label: 'Médecins partenaires' },
    { value: '10k+', label: 'Patients accompagnés' },
    { value: '98%', label: 'Taux de satisfaction' },
    { value: '24/7', label: 'Support disponible' }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'Diagnostic IA',
      description: 'Notre intelligence artificielle analyse les symptômes avec une précision médicale pour vous orienter vers le bon spécialiste.'
    },
    {
      icon: '👨‍⚕️',
      title: 'Médecins qualifiés',
      description: 'Accédez à un réseau de médecins partenaires soigneusement sélectionnés et validés par notre équipe médicale.'
    },
    {
      icon: '🔒',
      title: 'Confidentialité',
      description: 'Vos données médicales sont cryptées et protégées selon les normes les plus strictes de confidentialité.'
    },
    {
      icon: '⚡',
      title: 'Rapide & Efficace',
      description: 'Obtenez des recommandations en quelques minutes et prenez rendez-vous avec le spécialiste adapté à votre situation.'
    },
    {
      icon: '📊',
      title: 'Suivi personnalisé',
      description: 'Consultez l\'historique de vos diagnostics et suivez l\'évolution de votre santé dans le temps.'
    },
    {
      icon: '🌍',
      title: 'Disponible partout',
      description: 'Accédez à MyDiagAI depuis votre ordinateur, tablette ou smartphone, où que vous soyez.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sophie Martin',
      role: 'Directrice médicale',
      bio: 'Ancienne chef de clinique, spécialiste en santé publique avec 15 ans d\'expérience.'
    },
    {
      name: 'Dr. Thomas Bernard',
      role: 'Responsable IA médicale',
      bio: 'Docteur en intelligence artificielle appliquée à la médecine, passionné par l\'innovation.'
    },
    {
      name: 'Claire Dubois',
      role: 'Directrice des opérations',
      bio: 'Experte en gestion de plateformes de santé, elle assure le bon fonctionnement de MyDiagAI.'
    }
  ];

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

        .about-container {
          min-height: 100vh;
          padding: 20px;
          background: #eef2f3;
        }

        .about-card {
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
          padding-bottom: 20px;
          border-bottom: 2px solid #eef2f3;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
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

        /* Hero section */
        .hero-section {
          text-align: center;
          margin-bottom: 50px;
        }

        .hero-title {
          font-size: 42px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero-title span {
          color: #2f9e95;
        }

        .hero-subtitle {
          font-size: 18px;
          color: #666;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Stats section */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-align: center;
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

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #2f9e95;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 15px;
          color: #666;
          font-weight: 500;
        }

        /* Mission section */
        .mission-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
          padding: 40px;
          background: #f8fbfb;
          border-radius: 30px;
          border: 1px solid #e0ecea;
        }

        .mission-content h2 {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
        }

        .mission-content h2 span {
          color: #2f9e95;
        }

        .mission-content p {
          color: #666;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .mission-image {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 120px;
          background: white;
          border-radius: 30px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        /* Features section */
        .features-section {
          margin-bottom: 50px;
        }

        .section-title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 40px;
        }

        .section-title span {
          color: #2f9e95;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: #2f9e95;
          box-shadow: 0 20px 30px rgba(47, 158, 149, 0.15);
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        .feature-card p {
          color: #666;
          font-size: 15px;
          line-height: 1.6;
        }

        /* Team section */
        .team-section {
          margin-bottom: 50px;
          padding: 40px;
          background: #f8fbfb;
          border-radius: 30px;
          border: 1px solid #e0ecea;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin-top: 30px;
        }

        .team-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .team-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.1);
        }

        .team-avatar {
          width: 100px;
          height: 100px;
          background: #2f9e95;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
          font-size: 40px;
          font-weight: 600;
        }

        .team-card h4 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .team-role {
          color: #2f9e95;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 15px;
        }

        .team-bio {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Contact section */
        .contact-section {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, #2f9e95 0%, #267a73 100%);
          border-radius: 30px;
          color: white;
        }

        .contact-section h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .contact-section p {
          font-size: 16px;
          margin-bottom: 30px;
          opacity: 0.9;
        }

        .contact-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .contact-btn {
          background: white;
          color: #2f9e95;
          border: none;
          padding: 12px 30px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .contact-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .contact-btn.outline {
          background: transparent;
          color: white;
          border: 2px solid white;
          box-shadow: none;
        }

        .contact-btn.outline:hover {
          background: white;
          color: #2f9e95;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #eef2f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #999;
          font-size: 14px;
        }

        .footer-links {
          display: flex;
          gap: 30px;
        }

        .footer-links a {
          color: #666;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: #2f9e95;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
          }
          
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .mission-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .about-card {
            padding: 20px;
          }
          
          .stats-grid,
          .features-grid,
          .team-grid {
            grid-template-columns: 1fr;
          }
          
          .hero-title {
            font-size: 32px;
          }
          
          .contact-buttons {
            flex-direction: column;
          }
          
          .footer {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .footer-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        `}
      </style>

      <div className="about-container">
        <div className="about-card">
          {/* Navigation */}
          <nav className="navbar">
            <div className="logo">
              <img src="/logo_app.png" alt="MyDiagAI" />
              MyDiagAI
            </div>
            
            <div className="nav-links">
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Accueil</a>
              <a href="#" className="nav-link active">À propos</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Connexion</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="hero-section">
            <h1 className="hero-title">
              Votre santé, <span>notre mission</span>
            </h1>
            <p className="hero-subtitle">
              MyDiagAI est une plateforme innovante qui utilise l'intelligence artificielle 
              pour vous aider à trouver le bon médecin et à mieux comprendre vos symptômes.
            </p>
          </div>

          {/* Stats Section */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="mission-section">
            <div className="mission-content">
              <h2>Notre <span>mission</span></h2>
              <p>
                Chez MyDiagAI, nous croyons que chaque personne mérite un accès rapide et 
                fiable à des soins de qualité. Notre plateforme a été créée pour démocratiser 
                l'accès au diagnostic médical et faciliter la mise en relation entre patients 
                et professionnels de santé.
              </p>
              <p>
                Grâce à notre technologie d'intelligence artificielle de pointe, nous analysons 
                les symptômes avec une précision remarquable et orientons les patients vers 
                les spécialistes les plus adaptés à leur situation.
              </p>
            </div>
            <div className="mission-image">
              🏥
            </div>
          </div>

          {/* Features Section */}
          <div className="features-section">
            <h2 className="section-title">
              Pourquoi choisir <span>MyDiagAI</span> ?
            </h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="team-section">
            <h2 className="section-title">
              L'équipe <span>derrière</span> MyDiagAI
            </h2>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-avatar">
                    {member.name.charAt(0)}
                  </div>
                  <h4>{member.name}</h4>
                  <div className="team-role">{member.role}</div>
                  <p className="team-bio">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h2>Prêt à prendre soin de votre santé ?</h2>
            <p>
              Rejoignez des milliers de patients qui utilisent déjà MyDiagAI 
              pour améliorer leur parcours de soins.
            </p>
            <div className="contact-buttons">
              <button className="contact-btn" onClick={() => navigate('/')}>
                Créer un compte gratuit
              </button>
              <button className="contact-btn outline" onClick={() => navigate('/contact')}>
                Contacter l'équipe
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div>© 2024 MyDiagAI. Tous droits réservés.</div>
            <div className="footer-links">
              <a href="#">Mentions légales</a>
              <a href="#">Confidentialité</a>
              <a href="#">CGU</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ChooseSpace() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .card {
          background: white;
          padding: 50px;
          border-radius: 30px;
          width: 650px;
          text-align: center;
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

        .logo {
          width: 90px;
          height: 90px;
          background: #2f9e95;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          color: white;
          font-size: 40px;
          font-weight: 300;
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.3);
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.1);
        }

        .title {
          color: #2f9e95;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: #666;
          font-size: 16px;
          margin-bottom: 40px;
          font-weight: 400;
          line-height: 1.6;
        }

      
        .spaces { 
          display: flex;
          gap: 25px;
          margin-bottom: 40px;
        }

        .spaceCard {
          flex: 1;
          padding: 35px 25px;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .spaceCard::before {
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

        .spaceCard:hover::before {
          transform: scaleX(1);
        }

        .spaceCard:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 30px rgba(47, 158, 149, 0.2);
        }

        .spaceIcon {
          font-size: 48px;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }

        .spaceCard:hover .spaceIcon {
          transform: scale(1.2);
        }

        .spaceTitle {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #333;
          transition: color 0.3s ease;
        }

        .spaceCard:hover .spaceTitle {
          color: #2f9e95;
        }

        .spaceDesc {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          font-weight: 400;
        }

        .badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #2f9e95;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }

        .spaceCard:hover .badge {
          opacity: 1;
          transform: translateY(0);
          background: white;
          color: #2f9e95;
          border: 1px solid #2f9e95;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 2px solid #eef2f3;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #666;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .footer-link:hover {
          color: #2f9e95;
          transform: translateY(-2px);
        }

        .footer-note {
          margin-top: 25px;
          font-size: 13px;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .footer-note a {
          color: #2f9e95;
          text-decoration: none;
          font-weight: 600;
        }

        .footer-note a:hover {
          text-decoration: underline;
        }

        .heart {
          color: #2f9e95;
          font-size: 14px;
          animation: heartbeat 1.5s ease infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @media (max-width: 600px) {
          .card {
            padding: 30px 20px;
            width: 100%;
          }
          
          .spaces {
            flex-direction: column;
            gap: 15px;
          }
          
          .title {
            font-size: 28px;
          }
          
          .footer-links {
            gap: 20px;
          }
        }
        `}
      </style>

      <div className="container">
        <div className="card">
          <img 
            className="img" 
            src="/logo_app.png" 
            alt="MyDiagAI logo" 
            style={{ width: "250px", height: "250px", display: "block", margin: "0 auto" }} 
          />
          <p className="subtitle">
            Plateforme de diagnostic médical intelligent
          </p>

          <div className="spaces">
            <div
              className="spaceCard"
              onClick={() => navigate("/doctor-login")}
              onMouseEnter={() => setHoveredCard('doctor')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="spaceIcon">👨‍⚕️</div>
              <div className="spaceTitle">Espace Médecin</div>
              <div className="spaceDesc">
                Accédez à votre tableau de bord<br />
                et gérez les diagnostics
              </div>
              <div className="badge">Professionnel</div>
            </div>

            <div
              className="spaceCard"
              onClick={() => navigate("/patient-dashboard")}
              onMouseEnter={() => setHoveredCard('user')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="spaceIcon">👤</div>
              <div className="spaceTitle">Espace Utilisateur</div>
              <div className="spaceDesc">
                Consultez les médecins<br />
                et obtenez des recommandations
              </div>
              <div className="badge">Patient</div>
            </div>
          </div>

          <div className="footer-links">
            <a href="/about" className="footer-link">À propos</a>
            <a href="/contact" className="footer-link">Contact</a>
            <a href="/legal" className="footer-link">CGU</a>
            <a href="/help" className="footer-link">Aide</a>
          </div>

          <div className="footer-note">
            <span>🏥 Votre santé, notre priorité</span>
            <span className="heart">❤️</span>
            <span>·</span>
            <a href="#"> En savoir plus</a>
          </div>
        </div>
      </div>
    </>
  );
}
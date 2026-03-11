import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Le nom complet est requis';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Formulaire soumis:', formData);
      
      if (isLogin) {
        navigate('/patient-dashboard');
      } else {
        navigate('/auth?registered=true');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
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

        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2f3;
          padding: 20px;
        }

        .auth-card {
          max-width: 480px;
          width: 100%;
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

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .logo img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          margin-bottom: 10px;
        }

        .logo span {
          font-weight: 700;
          font-size: 28px;
          color: #2f9e95;
          letter-spacing: -0.3px;
        }

        .auth-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }

        .auth-header p {
          color: #666;
          font-size: 15px;
        }

        .auth-header p a {
          color: #2f9e95;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .auth-header p a:hover {
          color: #1e6b64;
          text-decoration: underline;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #eef2f3;
          border-radius: 15px;
          font-size: 15px;
          color: #333;
          background: white;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #2f9e95;
          box-shadow: 0 0 0 3px rgba(47, 158, 149, 0.1);
        }

        .form-input.error {
          border-color: #dc3545;
        }

        .form-input::placeholder {
          color: #999;
        }

        .error-message {
          color: #dc3545;
          font-size: 13px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .password-requirements {
          margin-top: 8px;
          padding: 12px;
          background: #f8fbfb;
          border-radius: 10px;
          font-size: 13px;
          color: #666;
          border: 1px solid #e0ecea;
        }

        .password-requirements ul {
          list-style: none;
          margin-top: 5px;
        }

        .password-requirements li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 3px;
        }

        .password-requirements li.valid {
          color: #2f9e95;
        }

        .auth-btn {
          width: 100%;
          background: #2f9e95;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.3);
          margin-top: 20px;
        }

        .auth-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.4);
          background: #267a73;
        }

        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 30px 0 20px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 2px solid #eef2f3;
        }

        .divider span {
          padding: 0 15px;
          color: #666;
          font-size: 14px;
        }

        .social-btn {
          width: 100%;
          background: white;
          border: 2px solid #eef2f3;
          padding: 12px;
          border-radius: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          border-color: #2f9e95;
          background: #f8fbfb;
          transform: translateY(-2px);
        }

        .social-btn img {
          width: 20px;
          height: 20px;
        }

        .forgot-password {
          text-align: right;
          margin-top: 10px;
        }

        .forgot-password a {
          color: #2f9e95;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .forgot-password a:hover {
          color: #1e6b64;
          text-decoration: underline;
        }

        .back-home {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #eef2f3;
        }

        .back-home a {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .back-home a:hover {
          color: #2f9e95;
          transform: translateX(-5px);
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 30px 20px;
          }

          .auth-header h1 {
            font-size: 22px;
          }
          
          .logo img {
            width: 100px;
            height: 100px;
          }
          
          .logo span {
            font-size: 24px;
          }
        }
        `}
      </style>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <img src="/logo_app.png" alt="MyDiagAI" />
              <span>MyDiagAI</span>
            </div>
            <h1>{isLogin ? 'Bon retour parmis nous !' : 'Rejoignez MyDiagAI'}</h1>
            <p>
              {isLogin ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
              <a onClick={toggleMode}>
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input
                  type="text"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <div className="error-message">
                    <span>⚠️</span> {errors.fullName}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="rymrabati@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="error-message">
                  <span>⚠️</span> {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="error-message">
                  <span>⚠️</span> {errors.password}
                </div>
              )}

              {!isLogin && formData.password && (
                <div className="password-requirements">
                  <span>Le mot de passe doit contenir :</span>
                  <ul>
                    <li className={formData.password.length >= 6 ? 'valid' : ''}>
                      {formData.password.length >= 6 ? '✅' : '○'} Au moins 6 caractères
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <div className="error-message">
                    <span>⚠️</span> {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <a href="#">Mot de passe oublié ?</a>
              </div>
            )}

            <button type="submit" className="auth-btn">
              {isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div className="divider">
            <span>ou</span>
          </div>

          <button className="social-btn">
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            {isLogin ? 'Continuer avec Google' : 'S\'inscrire avec Google'}
          </button>

          <div className="back-home">
            <a onClick={() => navigate('/')}>
              <span>←</span> Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
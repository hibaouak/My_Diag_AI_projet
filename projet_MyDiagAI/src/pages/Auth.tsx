import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/mydiagai-logo.png"; // Vérifiez que ce chemin est correct

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  // États pour la connexion
  const [loginEmail, setLoginEmail] = useState("admin@diagnostic.com");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  // États pour l'inscription
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    
    const result = await login({
      email: loginEmail,
      password: loginPassword
    });
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setLoginError(result.error || "Erreur de connexion");
    }
    
    setLoginLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    
    // Validation
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (registerPassword.length < 4) {
      setRegisterError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }
    
    setRegisterLoading(true);
    
    const result = await register({
      full_name: registerName,
      email: registerEmail,
      password: registerPassword
    });
    
    if (result.success) {
      setRegisterSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      
      setTimeout(() => {
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        if (loginTab) {
          loginTab.click();
        }
        setRegisterSuccess("");
      }, 2000);
    } else {
      setRegisterError(result.error || "Erreur lors de l'inscription");
    }
    
    setRegisterLoading(false);
  };

  return (
    <>
      <style>
        {`
        /* Style global */
        .auth-page {
          background: #eef2f3;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: 'Inter', sans-serif;
        }

        /* Style de la carte */
        .auth-card {
          border-radius: 30px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1) !important;
          border: none !important;
          animation: fadeIn 0.8s ease-out;
          max-width: 28rem;
          width: 100%;
          background: white !important;
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

        /* Style de l'en-tête */
        .auth-header {
          text-align: center;
          padding: 2rem 2rem 1rem !important;
        }

        .logo-container {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: #2f9e95;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

      

        .auth-title {
          color: #2f9e95 !important;
          font-size: 28px !important;
          font-weight: 700 !important;
          margin-bottom: 0.5rem !important;
        }

        .auth-description {
          color: #666 !important;
          font-size: 15px !important;
        }

        /* Style des tabs */
        .auth-tabs-list {
          background: #f8fbfb !important;
          border-radius: 40px !important;
          padding: 5px !important;
          margin: 0 2rem 1.5rem !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 5px !important;
        }

      .auth-tab-trigger {
  border-radius: 40px !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  padding: 10px !important;
  color: #666 !important;
  transition: all 0.3s ease !important;
  border: none !important;

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  width: 100%;   /* important */
  margin-left:70px;
}

        .auth-tab-trigger[data-state="active"] {
          background: #2f9e95 !important;
          color: white !important;
        }

        .auth-tab-trigger:hover:not([data-state="active"]) {
          color: #2f9e95 !important;
          background: white !important;
        }

        /* Style du contenu */
        .auth-content {
          padding: 0 2rem 2rem !important;
        }

        /* Style des formulaires */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: #333 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }

        .form-input {
          border-radius: 15px !important;
          border: 2px solid #eef2f3 !important;
          padding: 12px 20px !important;
          font-size: 15px !important;
          transition: all 0.3s ease !important;
          background: white !important;
          color: #333 !important;
          height: auto !important;
        }

        .form-input:focus {
          border-color: #2f9e95 !important;
          box-shadow: 0 0 0 3px rgba(47, 158, 149, 0.1) !important;
          outline: none !important;
        }

        .form-input::placeholder {
          color: #999 !important;
        }

        /* Style des alertes */
        .auth-alert {
          border-radius: 15px !important;
          margin-bottom: 1rem !important;
          border: none !important;
          padding: 1rem 1.25rem !important;
        }

        .auth-alert.destructive {
          background: #fff5f5 !important;
          border: 1px solid #ffcdcd !important;
          color: #dc3545 !important;
        }

        .auth-alert.success {
          background: #f0f9f0 !important;
          border: 1px solid #c3e6c3 !important;
          color: #28a745 !important;
        }

        /* Style du bouton */
        .auth-button {
          background: #2f9e95 !important;
          color: white !important;
          border-radius: 40px !important;
          padding: 12px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          box-shadow: 0 10px 20px rgba(47, 158, 149, 0.3) !important;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          border: none !important;
          height: auto !important;
          margin-top: 0.5rem !important;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-5px) !important;
          box-shadow: 0 15px 30px rgba(47, 158, 149, 0.4) !important;
          background: #267a73 !important;
        }

        .auth-button:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        /* Style du lien mot de passe oublié */
        .forgot-password {
          text-align: right;
          margin-top: -0.5rem;
        }

        .forgot-password a {
          color: #2f9e95;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.3s ease;
          cursor: pointer;
        }

        .forgot-password a:hover {
          color: #1e6b64;
          text-decoration: underline;
        }

        /* Style responsive */
        @media (max-width: 480px) {
          .auth-tabs-list {
            margin: 0 1rem 1.5rem !important;
          }
          
          .auth-content {
            padding: 0 1rem 1.5rem !important;
          }
          
          .auth-header {
            padding: 1.5rem 1rem 0.5rem !important;
          }
           .back-home {
          text-align: center;
          margin-top: 20px;
        }
          .back-home  {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: color 0.3s ease;
        }

        .back-home  {
          color: var(--primary-color);
        }

        }
        `}
      </style>

      <div className="auth-page">
        <Card className="auth-card">
          <CardHeader className="auth-header">
            <div className="logo-container">
              {/* OPTION 1: Utiliser l'import (recommandé) */}
              <img src="/logo_app.png" alt="MyDiagAI" />
              
            
            </div>
            <div>
              <CardTitle className="auth-title">
                MyDiagAI
              </CardTitle>
              <CardDescription className="auth-description">
                Plateforme de diagnostic médical intelligent
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="auth-content">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="auth-tabs-list">
                <TabsTrigger value="login" className="auth-tab-trigger">Connexion</TabsTrigger>
                
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="auth-form">
                  {loginError && (
                    <Alert variant="destructive" className="auth-alert destructive">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="form-group">
                    <Label htmlFor="login-email" className="form-label">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="login-password" className="form-label">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="forgot-password">
                    <a href="#">Mot de passe oublié ?</a>
                  </div>
                  
                  <Button
                    type="submit"
                    className="auth-button w-full"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                   <a className="back-home" onClick={() => navigate('/')} >
              <span>←</span> Retour à l'accueil
            </a>
                </form>
              </TabsContent>
              
              
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
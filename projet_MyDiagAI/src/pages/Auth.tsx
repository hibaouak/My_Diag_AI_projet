import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert"; // ← AJOUTER
import { useAuth } from "@/contexts/AuthContext"; // ← AJOUTER
import logo from "@/assets/mydiagai-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth(); // ← AJOUTER
  
  // États pour la connexion
  const [loginEmail, setLoginEmail] = useState("admin@diagnostic.com"); // ← MODIFIER
  const [loginPassword, setLoginPassword] = useState("admin123"); // ← MODIFIER
  const [loginError, setLoginError] = useState(""); // ← AJOUTER
  const [loginLoading, setLoginLoading] = useState(false); // ← MODIFIER
  
  // États pour l'inscription
 const [registerName, setRegisterName] = useState(""); // ← AJOUTER
  const [registerEmail, setRegisterEmail] = useState(""); // ← AJOUTER
  const [registerPassword, setRegisterPassword] = useState(""); // ← AJOUTER
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState(""); // ← AJOUTER
  const [registerError, setRegisterError] = useState(""); // ← AJOUTER
  const [registerSuccess, setRegisterSuccess] = useState(""); // ← AJOUTER
  const [registerLoading, setRegisterLoading] = useState(false); // ← AJOUTER

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); // ← AJOUTER
    setLoginLoading(true); // ← MODIFIER
    
    // Appeler l'API réelle au lieu de la simulation
    const result = await login({ // ← MODIFIER
      email: loginEmail,
      password: loginPassword
    });
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setLoginError(result.error || "Erreur de connexion"); // ← AJOUTER
    }
    
    setLoginLoading(false); // ← MODIFIER
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(""); // ← AJOUTER
    setRegisterSuccess(""); // ← AJOUTER
    
    // Validation
    if (registerPassword !== registerConfirmPassword) { // ← AJOUTER
      setRegisterError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (registerPassword.length < 4) { // ← AJOUTER
      setRegisterError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }
    
    setRegisterLoading(true); // ← AJOUTER
    
    // Appeler l'API réelle
    const result = await register({ // ← MODIFIER
      full_name: registerName,
      email: registerEmail,
      password: registerPassword
    });
    
    if (result.success) {
      setRegisterSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter."); // ← AJOUTER
      // Réinitialiser le formulaire
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      
      // Basculer vers l'onglet de connexion après 2 secondes
      setTimeout(() => {
        // Trouver et cliquer sur l'onglet de connexion
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        if (loginTab) {
          loginTab.click();
        }
        setRegisterSuccess("");
      }, 2000);
    } else {
      setRegisterError(result.error || "Erreur lors de l'inscription"); // ← AJOUTER
    }
    
    setRegisterLoading(false); // ← AJOUTER
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary p-4">
            <img src={logo} alt="MyDiagAI" className="h-full w-full" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MyDiagAI
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Plateforme de diagnostic médical intelligent
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full ">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              {/*<TabsTrigger value="register">Inscription</TabsTrigger>*/}
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Ajouter les messages d'erreur */}
                {loginError && ( // ← AJOUTER
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    value={loginEmail} // ← AJOUTER
                    onChange={(e) => setLoginEmail(e.target.value)} // ← AJOUTER
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={loginPassword} // ← AJOUTER
                    onChange={(e) => setLoginPassword(e.target.value)} // ← AJOUTER
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginLoading} // ← MODIFIER
                >
                  {loginLoading ? "Connexion..." : "Se connecter"} {/* ← MODIFIER */}
                </Button>
              </form>
              
              
            </TabsContent>
            
           {/* <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Ajouter les messages d'erreur/succès
                {registerError && ( // ← AJOUTER
                  <Alert variant="destructive">
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}
                
                {registerSuccess && ( // ← AJOUTER
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      {registerSuccess}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nom complet</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Dr. Jean Dupont"
                    required
                    value={registerName} // ← AJOUTER
                    onChange={(e) => setRegisterName(e.target.value)} // ← AJOUTER
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    value={registerEmail} // ← AJOUTER
                    onChange={(e) => setRegisterEmail(e.target.value)} // ← AJOUTER
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={registerPassword} // ← AJOUTER
                    onChange={(e) => setRegisterPassword(e.target.value)} // ← AJOUTER
                  />
                </div>
                <div className="space-y-2"> {/* ← AJOUTER ce div complet 
                  <Label htmlFor="register-confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerLoading} // ← MODIFIER
                >
                  {registerLoading ? "Inscription..." : "S'inscrire"} {/* ← MODIFIER 
                </Button>
              </form>
            </TabsContent>*/}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
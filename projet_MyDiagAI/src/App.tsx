import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Diagnostic from "@/pages/Diagnostic";
import Results from "@/pages/Results";
import Statistics from "@/pages/Statistics";
import Settings from "@/pages/Settings";
import SettingsPatient from "@/pages/Settings-patient";
import NotFound from "@/pages/NotFound";
import ChooseSpace from "@/pages/Choosespace";
import PatientDashboard from "@/pages/patient-dashboard";
import Recherche from "@/pages/Recherche";
import AuthPatient from "./pages/Auth-patient";
import About from "./pages/About";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ChooseSpace />} />
            
            {/* Page d'authentification publique */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Espace Patient - accessible sans authentification pour l'instant */}
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            
            {/* Espace Patient - Page Paramètres */}
            <Route path="/settings-patient" element={<SettingsPatient />} />

            <Route path="/Auth-patient" element={<AuthPatient />} />
             <Route path="/About" element={<About/>} />
            
              {/* Espace Patient - Page Recherche */}
              <Route path="/Recherche" element={<Recherche />} />
            {/* Routes protégées - Espace Médecin (besoin d'être connecté) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/diagnostic" element={
              <ProtectedRoute>
                <Diagnostic />
              </ProtectedRoute>
            } />
            
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Route pour les pages non trouvées */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
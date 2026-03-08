// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, TrendingUp, Clock, Plus, BarChart3, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "@/services/statsService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  total_diagnostics: number;
  total_patients: number;
  accuracy: number;
  recent_diagnostics: Array<{
    id: string;
    patient_name: string;
    date: string;
    top_disease: string;
  }>;
  top_diseases: Array<{
    disease: string;
    count: number;
  }>;
  current_user?: string;
  user_type?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardData>({
    total_diagnostics: 0,
    total_patients: 0,
    accuracy: 0,
    recent_diagnostics: [],
    top_diseases: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    loadDashboardData();
    
    // Rafraîchir automatiquement toutes les 30 secondes
    const intervalId = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    // Rafraîchir quand on revient sur la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Débogage
      console.log("📊 Dashboard data loaded:", {
        total_diagnostics: data.total_diagnostics,
        total_patients: data.total_patients,
        accuracy: data.accuracy,
        recent_count: data.recent_diagnostics?.length || 0,
        current_user: user?.full_name,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
    toast({
      title: "Actualisé",
      description: "Les données ont été rafraîchies",
    });
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays}j`;
    } catch (e) {
      return "Date inconnue";
    }
  };

  if (loading && stats.total_diagnostics === 0) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="h-48 bg-gradient-primary/10 rounded-2xl animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header avec informations utilisateur */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground shadow-hover">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">
                      Bonjour, {user?.full_name?.split(' ')[0] || 'Docteur'} 
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {user?.user_type === 'admin' ? 'Administrateur' : 'Médecin'}
                      </Badge>
                      <p className="text-sm opacity-80">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <p className="text-lg opacity-90 mb-6">
                  Assistant intelligent pour le diagnostic médical
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshData}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                {lastUpdate && (
                  <p className="text-xs opacity-70">
                    Dernière mise à jour: {lastUpdate}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/diagnostic")}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nouveau Diagnostic
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/statistics")}
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Voir les statistiques
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid avec données réelles */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Diagnostics
              </CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_diagnostics}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total effectués
              </p>
              {stats.total_diagnostics > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {stats.recent_diagnostics?.length > 0 
                    ? `${stats.recent_diagnostics.length} ce mois` 
                    : "Actif"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patients
              </CardTitle>
              <Users className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_patients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Patients uniques
              </p>
              {stats.total_patients > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {Math.min(stats.total_patients, stats.recent_diagnostics?.length || 0)} actifs
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Précision
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.accuracy}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Moyenne IA
              </p>
              {stats.accuracy > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Basée sur {stats.total_diagnostics} diagnostics
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dernier
              </CardTitle>
              <Clock className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.recent_diagnostics && stats.recent_diagnostics.length > 0 
                  ? stats.recent_diagnostics[0].patient_name 
                  : '-'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dernier diagnostic
              </p>
              {stats.recent_diagnostics && stats.recent_diagnostics.length > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  {stats.recent_diagnostics[0].patient_name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message si pas de données */}
        {stats.total_diagnostics === 0 && (
          <Card className="shadow-card border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Activity className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  Aucun diagnostic encore
                </h3>
                <p className="text-amber-700 mb-4">
                  Commencez par effectuer votre premier diagnostic pour voir les statistiques.
                </p>
                <Button
                  onClick={() => navigate("/diagnostic")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Premier Diagnostic
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity - seulement si des données existent */}
        {stats.recent_diagnostics && stats.recent_diagnostics.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Récent</CardTitle>
                    <CardDescription>Derniers diagnostics</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {stats.recent_diagnostics.length} récents
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.recent_diagnostics.slice(0, 5).map((diag) => (
                  <div
                    key={diag.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0 hover:bg-accent/50 p-2 rounded transition-colors"
                  >
                    <div>
                      <p className="font-medium">{diag.patient_name || 'Patient'}</p>
                      <p className="text-sm text-muted-foreground">
                        {diag.top_disease || 'Inconnu'} • {getTimeAgo(diag.date)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/statistics?diagnostic_id=${diag.id}`)}
                    >
                      Voir
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Accès rapide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/diagnostic")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau diagnostic
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/statistics")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistiques détaillées
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={refreshData}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser les données
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top diseases si disponibles */}
        {stats.top_diseases && stats.top_diseases.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Maladies Fréquentes</CardTitle>
              <CardDescription>
                Les {stats.top_diseases.length} maladies les plus diagnostiquées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_diseases.map((disease, index) => (
                  <div key={disease.disease} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{disease.disease}</p>
                        <p className="text-xs text-muted-foreground">
                          {disease.count} diagnostic{disease.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(disease.count / stats.total_diagnostics) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {Math.round((disease.count / stats.total_diagnostics) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
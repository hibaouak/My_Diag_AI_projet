// src/pages/Statistics.tsx
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, Users, Clock, Target, RefreshCw, AlertCircle } from "lucide-react";
import { getStats } from "@/services/statsService";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface StatisticsData {
  total_diagnostics: number;
  total_patients: number;
  average_accuracy: number;
  average_duration: number;
  top_diseases: Array<{ disease: string; count: number; trend: string }>;
  monthly_stats: Array<{ month: string; diagnostics: number }>;
  category_stats: Array<{ category: string; percentage: number; color: string }>;
}

const Statistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatisticsData>({
    total_diagnostics: 0,
    total_patients: 0,
    average_accuracy: 0,
    average_duration: 0,
    top_diseases: [],
    monthly_stats: [],
    category_stats: []
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    loadStatistics();
    
    // Rafraîchir automatiquement toutes les 30 secondes
    const intervalId = setInterval(() => {
      loadStatistics();
    }, 30000);
    
    // Rafraîchir quand la page devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStatistics();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      console.log("📊 Chargement des statistiques...");
      
      const data = await getStats();
      setStats(data);
      setLastUpdate(new Date().toLocaleTimeString());
      
      console.log("✅ Statistiques chargées:", {
        total_diagnostics: data.total_diagnostics,
        total_patients: data.total_patients,
        accuracy: data.average_accuracy,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadStatistics();
    toast({
      title: "Actualisé",
      description: "Les statistiques ont été mises à jour",
    });
  };

  if (loading && stats.total_diagnostics === 0) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Statistiques</h1>
            <p className="text-muted-foreground text-lg">
              Chargement des données...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* En-tête avec bouton de rafraîchissement */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Statistiques</h1>
            <p className="text-muted-foreground text-lg">
              Données réelles du système • {stats.total_diagnostics} diagnostic{stats.total_diagnostics !== 1 ? 's' : ''}
            </p>
            {lastUpdate && (
              <p className="text-sm text-muted-foreground mt-1">
                Dernière mise à jour: {lastUpdate}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshStats}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/diagnostic")}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Nouveau diagnostic
            </Button>
          </div>
        </div>

        {/* Message si pas de données */}
        {stats.total_diagnostics === 0 && (
          <Card className="shadow-card border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
                <h3 className="text-2xl font-semibold text-amber-800 mb-2">
                  Aucune donnée statistique disponible
                </h3>
                <p className="text-amber-700 mb-6 max-w-md">
                  Effectuez votre premier diagnostic pour commencer à collecter des statistiques.
                  Vos données apparaîtront automatiquement ici.
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/diagnostic")}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Premier Diagnostic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={refreshStats}
                  >
                    Vérifier à nouveau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Afficher les statistiques seulement si des données existent */}
        {stats.total_diagnostics > 0 && (
          <>
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Diagnostics
                  </CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_diagnostics}</div>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    Total effectués
                  </p>
                  {stats.monthly_stats.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Ce mois: {stats.monthly_stats[stats.monthly_stats.length - 1]?.diagnostics || 0}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Patients
                  </CardTitle>
                  <Users className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_patients}</div>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    Patients uniques
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Moyenne: {stats.total_diagnostics > 0 ? (stats.total_diagnostics / stats.total_patients).toFixed(1) : 0} diag/patient
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Précision
                  </CardTitle>
                  <Target className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.average_accuracy}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Moyenne des diagnostics
                  </p>
                  <div className="mt-2">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${stats.average_accuracy}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Durée
                  </CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.average_duration.toFixed(1)} min</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Temps moyen par diagnostic
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Rapide
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bar Chart */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Activité Mensuelle</CardTitle>
                  <CardDescription>
                    Diagnostics par mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.monthly_stats.length > 0 ? (
                      stats.monthly_stats.map((data) => {
                        const maxDiagnostics = Math.max(...stats.monthly_stats.map(m => m.diagnostics));
                        const percentage = maxDiagnostics > 0 ? (data.diagnostics / maxDiagnostics) * 100 : 0;
                        
                        return (
                          <div key={data.month} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{data.month}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {data.diagnostics}
                                </Badge>
                              </div>
                              <span className="text-muted-foreground">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune donnée mensuelle</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Diseases */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Maladies Fréquentes</CardTitle>
                  <CardDescription>
                    Diagnostiquées le plus souvent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.top_diseases.length > 0 ? (
                      stats.top_diseases.map((disease, index) => (
                        <div
                          key={disease.disease}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{disease.disease}</p>
                              <p className="text-xs text-muted-foreground">
                                {disease.count} cas • {Math.round((disease.count / stats.total_diagnostics) * 100)}%
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              disease.trend.startsWith("+")
                                ? "text-success"
                                : disease.trend.startsWith("-")
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {disease.trend}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune donnée sur les maladies</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>
                  Distribution des diagnostics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {stats.category_stats.length > 0 ? (
                    stats.category_stats.map((cat) => (
                      <div key={cat.category} className="text-center">
                        <div className="mx-auto mb-2 h-20 w-20 rounded-full border-8 border-muted flex items-center justify-center relative overflow-hidden">
                          <div
                            className={`absolute inset-0 ${cat.color} opacity-20`}
                          />
                          <div
                            className={`absolute inset-0 ${cat.color}`}
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${
                                50 + 50 * Math.sin((cat.percentage / 100) * 2 * Math.PI)
                              }% ${50 - 50 * Math.cos((cat.percentage / 100) * 2 * Math.PI)}%)`,
                              opacity: 0.3
                            }}
                          />
                          <span className="text-lg font-bold relative z-10">{cat.percentage}%</span>
                        </div>
                        <p className="text-sm font-medium">{cat.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((cat.percentage / 100) * stats.total_diagnostics)} diagnostics
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-5 text-center py-6 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune répartition disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
                <CardDescription>
                  Vue d'ensemble du système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.total_diagnostics} diagnostics effectués avec une précision moyenne de {stats.average_accuracy}%
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stats.total_diagnostics > 10 ? "Expérimenté" : "Débutant"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Patients</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.total_patients} patients uniques suivis dans le système
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Engagement: {stats.total_diagnostics > 0 ? Math.round((stats.total_diagnostics / stats.total_patients) * 10) / 10 : 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Efficacité</h4>
                    <p className="text-sm text-muted-foreground">
                      Temps moyen de diagnostic : {stats.average_duration.toFixed(1)} minutes
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stats.average_duration < 2 ? "Très rapide" : "Efficace"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Statistics;
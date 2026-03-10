// src/pages/History.tsx
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Calendar, User, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { getHistory, Diagnostic } from "@/services/historyService";

const History = () => {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [filtered, setFiltered] = useState<Diagnostic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getHistory(100, 0); // Récupère les 100 derniers
        setDiagnostics(data.diagnostics);
        setFiltered(data.diagnostics);
      } catch (error: any) {
        console.error("Erreur chargement historique:", error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger l'historique",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filtre local sur le nom du patient ou la maladie principale
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(
      diagnostics.filter(d => 
        d.patient_name.toLowerCase().includes(term) ||
        (d.results[0]?.disease || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, diagnostics]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 75) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Historique des diagnostics</h1>
          <Button onClick={() => navigate("/diagnostic")}>
            <Activity className="mr-2 h-4 w-4" />
            Nouveau diagnostic
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par patient ou maladie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tableau des diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>Liste complète ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucun diagnostic trouvé.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Âge / Sexe</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Maladie principale</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((diag) => {
                    const topResult = diag.results?.[0] || { disease: "Inconnu", probability_percent: 0 };
                    return (
                      <TableRow key={diag.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {diag.patient_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {diag.age ? `${diag.age} ans` : "—"} / {diag.gender || "—"}
                        </TableCell>
                        <TableCell>{formatDate(diag.created_at)}</TableCell>
                        <TableCell>{topResult.disease}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(topResult.probability_percent)}`}>
                            {topResult.probability_percent}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/statistics?diagnostic_id=${diag.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
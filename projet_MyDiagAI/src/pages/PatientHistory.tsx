// src/pages/PatientHistory.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, Activity, Star, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getPatientHistory, PatientConsultation } from "@/services/patientHistoryService";

// Si vous n'avez pas de Layout spécifique patient, vous pouvez utiliser un simple conteneur
const PatientHistory = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<PatientConsultation[]>([]);
  const [filtered, setFiltered] = useState<PatientConsultation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getPatientHistory(100, 0);
        setConsultations(data.consultations);
        setFiltered(data.consultations);
      } catch (error: any) {
        console.error("Erreur chargement historique patient:", error);
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

  // Filtre local sur le nom du médecin, la spécialité ou la maladie
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(
      consultations.filter(c => 
        c.doctor_name.toLowerCase().includes(term) ||
        c.doctor_specialty.toLowerCase().includes(term) ||
        c.clinic_name.toLowerCase().includes(term) ||
        (c.disease && c.disease.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, consultations]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmé":
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case "en attente":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "annulé":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Historique des consultations</h1>
          <Button onClick={() => navigate("/recherche")}>
            <Activity className="mr-2 h-4 w-4" />
            Nouvelle recherche
          </Button>
        </div>
        

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par médecin, spécialité, clinique ou maladie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tableau des consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Liste complète ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucune consultation trouvée.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Clinique</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Diagnostic</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((consult) => (
                    <TableRow key={consult.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {consult.doctor_name}
                        </div>
                      </TableCell>
                      <TableCell>{consult.doctor_specialty}</TableCell>
                      <TableCell>{consult.clinic_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDate(consult.date)}
                        </div>
                      </TableCell>
                      <TableCell>{consult.disease || "—"}</TableCell>
                      <TableCell>{getStatusBadge(consult.status)}</TableCell>
                      <TableCell>{renderStars(consult.rating)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/consultation/${consult.id}`)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientHistory;
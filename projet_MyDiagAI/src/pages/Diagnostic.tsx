import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, Stethoscope, CheckCircle2 } from "lucide-react";
import { getSymptoms, performDiagnosis, checkHealth } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

// ✅ LISTE EXACTE DES 50 SYMPTÔMES DU MODÈLE (en cas de fallback)
const FALLBACK_SYMPTOMS = [
  "anxiety and nervousness",
  "depression",
  "shortness of breath",
  "sharp chest pain",
  "dizziness",
  "insomnia",
  "palpitations",
  "irregular heartbeat",
  "breathing fast",
  "hoarse voice",
  "sore throat",
  "difficulty speaking",
  "cough",
  "nasal congestion",
  "throat swelling",
  "difficulty in swallowing",
  "vomiting",
  "headache",
  "nausea",
  "diarrhea",
  "painful urination",
  "frequent urination",
  "blood in urine",
  "hand or finger pain",
  "arm pain",
  "back pain",
  "neck pain",
  "low back pain",
  "knee pain",
  "foot or toe pain",
  "ankle pain",
  "joint pain",
  "muscle pain",
  "muscle stiffness or tightness",
  "fatigue",
  "fever",
  "chills",
  "weight gain",
  "recent weight loss",
  "decreased appetite",
  "excessive appetite",
  "swollen lymph nodes",
  "skin rash",
  "skin lesion",
  "acne or pimples",
  "mouth ulcer",
  "eye redness",
  "diminished vision",
  "double vision",
  "seizures"
].sort();

const Diagnostic = () => {
  const navigate = useNavigate();
  
  // État pour les informations du patient
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    notes: ""
  });
  
  // État pour les symptômes
  const [symptomsList, setSymptomsList] = useState<string[]>(FALLBACK_SYMPTOMS);
  const [filteredSymptoms, setFilteredSymptoms] = useState<string[]>(FALLBACK_SYMPTOMS);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour le chargement et les erreurs
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  
  // État pour la navigation entre les étapes
  const [step, setStep] = useState<"info" | "symptoms">("info");

  // Vérifier la connexion au backend
  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log("🔍 Vérification de la connexion au backend...");
        await checkHealth();
        setBackendStatus("connected");
        console.log("✅ Backend connecté");
      } catch (err) {
        console.error("❌ Backend non accessible:", err);
        setBackendStatus("error");
        setError("Le serveur backend n'est pas accessible. Mode démonstration activé.");
      }
    };

    checkBackend();
  }, []);

  // Charger les symptômes depuis l'API
  useEffect(() => {
    const loadSymptoms = async () => {
      try {
        setLoadingSymptoms(true);
        setError(null);
        
        console.log("🔄 Chargement des symptômes...");
        
        if (backendStatus === "checking") {
          return;
        }
        
        if (backendStatus === "connected") {
          const symptomsData = await getSymptoms();
          console.log("📦 Données reçues de l'API:", symptomsData);
          
          let symptomsArray: string[] = [];
          
          if (Array.isArray(symptomsData)) {
            symptomsArray = symptomsData;
          } else if (symptomsData && symptomsData.symptoms && Array.isArray(symptomsData.symptoms)) {
            symptomsArray = symptomsData.symptoms;
          }
          
          symptomsArray = [...new Set(symptomsArray.filter(s => s && s.trim()))];
          
          if (symptomsArray.length > 0) {
            console.log(`✅ ${symptomsArray.length} symptômes chargés depuis l'API`);
            setSymptomsList(symptomsArray);
            setFilteredSymptoms(symptomsArray);
          } else {
            throw new Error("Aucun symptôme valide retourné");
          }
        } else {
          console.log("⚠️ Utilisation de la liste de secours (50 symptômes)");
          setSymptomsList(FALLBACK_SYMPTOMS);
          setFilteredSymptoms(FALLBACK_SYMPTOMS);
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement des symptômes:", err);
        console.log("⚠️ Utilisation de la liste de secours (50 symptômes)");
        setSymptomsList(FALLBACK_SYMPTOMS);
        setFilteredSymptoms(FALLBACK_SYMPTOMS);
      } finally {
        setLoadingSymptoms(false);
      }
    };

    loadSymptoms();
  }, [backendStatus]);

  // Filtrer les symptômes en fonction de la recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredSymptoms(symptomsList);
    } else {
      const filtered = symptomsList.filter(symptom => 
        symptom.toLowerCase().includes(term)
      );
      setFilteredSymptoms(filtered);
    }
  };

  // Gestion des changements dans les informations du patient
  const handlePatientInfoChange = (field: keyof typeof patientInfo, value: string) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestion de la sélection des symptômes
  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  // Sélectionner tous les symptômes filtrés
  const selectAllFiltered = () => {
    setSelectedSymptoms(filteredSymptoms);
  };

  // Désélectionner tous les symptômes
  const deselectAll = () => {
    setSelectedSymptoms([]);
  };

  // Valider les informations du patient
  const validatePatientInfo = () => {
    if (!patientInfo.name.trim()) {
      toast({
        title: "Nom manquant",
        description: "Veuillez saisir le nom complet du patient",
        variant: "destructive",
      });
      return false;
    }
    
    const age = parseInt(patientInfo.age);
    if (isNaN(age) || age < 1 || age > 120) {
      toast({
        title: "Âge invalide",
        description: "L'âge doit être un nombre entre 1 et 120",
        variant: "destructive",
      });
      return false;
    }
    
    if (!patientInfo.gender) {
      toast({
        title: "Genre manquant",
        description: "Veuillez sélectionner le genre du patient",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Passer à l'étape de sélection des symptômes
  const handleContinueToSymptoms = () => {
    console.log("🎯 Clic sur 'Continuer vers la sélection des symptômes'");
    console.log("📋 Données patient:", patientInfo);
    
    if (validatePatientInfo()) {
      console.log("✅ Validation réussie, passage à l'étape 2");
      setStep("symptoms");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log("❌ Validation échouée");
    }
  };

  // Revenir aux informations patient
  const handleBackToInfo = () => {
    setStep("info");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction de diagnostic
  const handleDiagnose = async () => {
    console.log("🎯 Clic sur 'Analyse avec l'IA'");
    console.log("📋 Symptômes sélectionnés:", selectedSymptoms);
    
    if (selectedSymptoms.length === 0) {
      toast({
        title: "Symptômes manquants",
        description: "Veuillez sélectionner au moins un symptôme",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingDiagnosis(true);
      
      // Préparer les données pour l'API
      const diagnosisData = {
        patient_name: patientInfo.name,
        symptoms: selectedSymptoms,
        age: parseInt(patientInfo.age),
        gender: patientInfo.gender as "M" | "F",
        additional_notes: patientInfo.notes
      };

      console.log("📤 Envoi des données au backend:", diagnosisData);
      
      const result = await performDiagnosis(diagnosisData);
      console.log("✅ Diagnostic reçu:", result);
      
      navigate("/results", { 
        state: { 
          diagnosisResult: result,
          patientInfo: patientInfo,
          selectedSymptoms: selectedSymptoms,
          isDemo: backendStatus !== "connected"
        } 
      });
      
    } catch (err: any) {
      console.error("❌ Erreur lors du diagnostic:", err);
      toast({
        title: "Erreur de diagnostic",
        description: err.message || "Une erreur est survenue lors de l'analyse",
        variant: "destructive",
      });
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  // Formater le nom des symptômes pour l'affichage
  const formatSymptomName = (symptom: string) => {
    return symptom
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Compter le nombre de symptômes sélectionnés
  const selectedCount = selectedSymptoms.length;

  // Rendu de l'étape "Informations patient"
  const renderPatientInfoStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            Nouveau Diagnostic
          </CardTitle>
          <CardDescription>
            Renseignez les informations du patient pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informations du Patient</h3>
            <p className="text-sm text-muted-foreground">
              Veuillez renseigner les informations du patient avant de continuer
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="name" className="font-semibold">
                Nom complet *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Jean Dupont"
                value={patientInfo.name}
                onChange={(e) => handlePatientInfoChange("name", e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Nom et prénom du patient
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="age" className="font-semibold">
                Âge *
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 35"
                min="1"
                max="120"
                value={patientInfo.age}
                onChange={(e) => handlePatientInfoChange("age", e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Âge en années (1-120)
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="gender" className="font-semibold">
                Genre *
              </Label>
              <Select
                value={patientInfo.gender}
                onValueChange={(value) => handlePatientInfoChange("gender", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Genre biologique du patient
              </p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="notes" className="font-semibold">
                Notes cliniques supplémentaires (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ex: Antécédents médicaux, traitements en cours, allergies..."
                rows={4}
                value={patientInfo.notes}
                onChange={(e) => handlePatientInfoChange("notes", e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Informations complémentaires pour l'analyse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            {backendStatus === "checking" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm">Vérification de la connexion au serveur...</span>
              </>
            )}
            {backendStatus === "connected" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Serveur backend connecté</span>
              </>
            )}
            {backendStatus === "error" && (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">Mode démonstration (backend non disponible)</span>
              </>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleContinueToSymptoms}
              disabled={loadingSymptoms || backendStatus === "checking"}
              className="gap-2 h-12 px-6 text-lg"
              size="lg"
            >
              {loadingSymptoms ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  Continuer vers la sélection des symptômes
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Rendu de l'étape "Sélection des symptômes"
  const renderSymptomsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToInfo}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux informations
        </Button>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            Sélection des Symptômes
          </CardTitle>
          <CardDescription>
            Sélectionnez les symptômes présentés par le patient
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Symptômes du Patient</h3>
            <p className="text-sm text-muted-foreground">
              Cochez tous les symptômes que présente le patient
            </p>
          </div>

          {loadingSymptoms ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des symptômes...</p>
            </div>
          ) : (
            <>
              {/* Barre de recherche */}
              <div className="relative">
                <Input
                  placeholder="Rechercher un symptôme..."
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllFiltered}
                >
                  Tout sélectionner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={deselectAll}
                >
                  Tout désélectionner
                </Button>
              </div>

              {/* Compteur */}
              <div className="text-sm text-muted-foreground">
                {filteredSymptoms.length} symptômes trouvés • {selectedCount} sélectionnés
              </div>

              {/* Liste des symptômes */}
              <div className="max-h-[500px] overflow-y-auto rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSymptoms.map((symptom, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 rounded-lg border p-3 transition-all hover:shadow-md cursor-pointer ${
                        selectedSymptoms.includes(symptom)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => handleSymptomToggle(symptom)}
                    >
                      <Checkbox
                        id={`symptom-${index}`}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`symptom-${index}`}
                        className="flex-1 cursor-pointer text-sm leading-tight"
                      >
                        {formatSymptomName(symptom)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBackToInfo}
              className="gap-2 h-12"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour aux informations patient
            </Button>
            
            <Button
              onClick={handleDiagnose}
              disabled={selectedSymptoms.length === 0 || loadingDiagnosis}
              className="gap-2 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              {loadingDiagnosis ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  Lancer l'analyse IA ({selectedCount})
                  <Stethoscope className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="container max-w-6xl py-6">
        {step === "info" ? renderPatientInfoStep() : renderSymptomsStep()}
      </div>
    </Layout>
  );
};

export default Diagnostic;
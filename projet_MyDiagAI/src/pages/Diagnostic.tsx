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
  const [symptomsList, setSymptomsList] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
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
        
        toast({
          title: "Mode démonstration",
          description: "Connexion au backend échouée. Utilisation des données de démonstration.",
          variant: "destructive",
        });
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
        
        // Attendre d'abord que le statut du backend soit vérifié
        if (backendStatus === "checking") {
          return;
        }
        
        if (backendStatus === "connected") {
          // Mode normal: charger depuis l'API
          const symptomsData = await getSymptoms();
          console.log("📦 Données reçues:", symptomsData);
          
          // S'assurer que nous avons un tableau
          let symptomsArray: string[] = [];
          
          if (Array.isArray(symptomsData)) {
            symptomsArray = symptomsData;
          } else if (symptomsData && symptomsData.symptoms && Array.isArray(symptomsData.symptoms)) {
            symptomsArray = symptomsData.symptoms;
          } else if (symptomsData && typeof symptomsData === 'object') {
            // Essayer de trouver un tableau dans l'objet
            const possibleArrays = Object.values(symptomsData).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              symptomsArray = possibleArrays[0] as string[];
            }
          }
          
          // Filtrer les doublons et valeurs vides
          symptomsArray = [...new Set(symptomsArray.filter(s => s && s.trim()))];
          
          if (symptomsArray.length > 0) {
            console.log(`✅ ${symptomsArray.length} symptômes uniques chargés`);
            setSymptomsList(symptomsArray);
          } else {
            throw new Error("Aucun symptôme valide retourné");
          }
        } else {
          // Mode démonstration: symptômes de secours
          console.log("⚠️ Utilisation des symptômes de démonstration");
          const demoSymptoms = [
            "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering",
            "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue",
            "muscle_wasting", "vomiting", "burning_micturition", "fatigue", "cough",
            "high_fever", "headache", "nausea", "loss_of_appetite", "back_pain",
            "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "redness_of_eyes",
            "sinus_pressure", "runny_nose", "congestion", "chest_pain", "shortness_of_breath"
          ];
          setSymptomsList(demoSymptoms);
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement des symptômes:", err);
        
        // Symptômes de secours
        const fallbackSymptoms = [
          "itching", "skin_rash", "cough", "headache", "fever",
          "fatigue", "nausea", "vomiting", "diarrhoea", "back_pain"
        ];
        setSymptomsList(fallbackSymptoms);
        
        toast({
          title: "Données limitées",
          description: "Chargement des symptômes partiel. Certaines données peuvent être manquantes.",
          variant: "destructive",
        });
      } finally {
        setLoadingSymptoms(false);
      }
    };

    loadSymptoms();
  }, [backendStatus]);

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

  // Valider les informations du patient
  const validatePatientInfo = () => {
    // Validation du nom
    if (!patientInfo.name.trim()) {
      toast({
        title: "Nom manquant",
        description: "Veuillez saisir le nom complet du patient",
        variant: "destructive",
      });
      return false;
    }
    
    // Validation de l'âge
    const age = parseInt(patientInfo.age);
    if (isNaN(age) || age < 1 || age > 120) {
      toast({
        title: "Âge invalide",
        description: "L'âge doit être un nombre entre 1 et 120",
        variant: "destructive",
      });
      return false;
    }
    
    // Validation du genre
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
      // Forcer le scroll vers le haut
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

 // Dans la fonction handleDiagnose() de Diagnostic.tsx
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
    
    // Préparer les données pour l'API - AJOUTER patient_name
    const diagnosisData = {
      patient_name: patientInfo.name, // AJOUTER CE CHAMP
      symptoms: selectedSymptoms,
      age: parseInt(patientInfo.age),
      gender: patientInfo.gender as "M" | "F",
      additional_notes: patientInfo.notes
    };

    console.log("📤 Envoi des données au backend:", diagnosisData);
    
    let result;
    
    if (backendStatus === "connected") {
      // Mode normal: appeler l'API
      result = await performDiagnosis(diagnosisData);
      console.log("✅ Diagnostic reçu depuis l'API:", result);
    } else {
      // Mode démonstration
      result = {
        success: true,
        diagnostic_assistant: {
          results: [
            {
              disease: "Common Cold",
              probability_percent: 78.5,
              probability_decimal: 0.785,
              confidence_level: "ÉLEVÉE - Diagnostic plausible",
              medical_action: "Traitement symptomatique recommandé",
              specific_guidance: "Repos et hydratation. Surveillance de la température.",
              suggested_tests: ["Température", "Examen ORL"],
              risk_level: "Faible",
              recommendations: [
                "Repos au lit",
                "Hydratation abondante",
                "Antipyrétiques si fièvre > 38.5°C"
              ]
            },
            {
              disease: "Seasonal Allergy",
              probability_percent: 45.2,
              probability_decimal: 0.452,
              confidence_level: "MODÉRÉE - Hypothèse à explorer",
              medical_action: "Considérer dans le diagnostic différentiel",
              specific_guidance: "Antihistaminiques si nécessaire. Éviction des allergènes.",
              suggested_tests: ["Tests allergiques", "Examen ORL"],
              risk_level: "Faible",
              recommendations: [
                "Éviter les allergènes connus",
                "Antihistaminiques si symptômes",
                "Nettoyage nasal"
              ]
            }
          ],
          patient_info: {
            patient_name: patientInfo.name, // AJOUTER ICI
            age: parseInt(patientInfo.age),
            gender: patientInfo.gender,
            symptoms_analyzed: selectedSymptoms,
            additional_notes: patientInfo.notes
          },
          disclaimer: "Résultat de démonstration - Diagnostic simulé"
        }
      };
      console.log("⚠️ Diagnostic simulé (backend non disponible)");
    }
    
    // Naviguer vers la page des résultats avec les bonnes clés
    navigate("/results", { 
      state: { 
        diagnosisResult: result, // Clé importante
        patientInfo: patientInfo, // Clé importante
        selectedSymptoms: selectedSymptoms, // Clé importante
        isDemo: backendStatus !== "connected" // Clé importante
      } 
    });
    
  } catch (err) {
    console.error("❌ Erreur lors du diagnostic:", err);
    
    toast({
      title: "Erreur de diagnostic",
      description: "Une erreur est survenue lors de l'analyse. Veuillez réessayer.",
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
              {/* Recherche de symptômes */}
              <div className="relative">
                <Input
                  placeholder="Rechercher un symptôme..."
                  className="pl-10 h-12"
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    // Note: Dans une version complète, on filtrerait ici
                  }}
                />
                <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              </div>

              {/* Liste des symptômes */}
              <div className="max-h-[500px] overflow-y-auto rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {symptomsList.map((symptom, index) => (
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

              {/* Panneau de résumé */}
              <div className="rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-5 border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-lg">Résumé de sélection</h4>
                  </div>
                  <div className="px-3 py-1 bg-primary/20 rounded-full">
                    <span className="text-sm font-semibold">
                      {selectedSymptoms.length} sélectionné(s)
                    </span>
                  </div>
                </div>

                {selectedSymptoms.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-semibold">Aucun symptôme sélectionné</span>
                      <br />
                      Veuillez sélectionner au moins un symptôme pour continuer
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <p className="text-sm mb-3">
                      <span className="font-semibold">{selectedSymptoms.length}</span> symptôme(s) sélectionné(s)
                    </p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">Symptômes choisis :</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSymptoms.slice(0, 10).map((symptom, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm"
                          >
                            <span>{formatSymptomName(symptom)}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSymptomToggle(symptom);
                              }}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {selectedSymptoms.length > 10 && (
                          <div className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-sm">
                            +{selectedSymptoms.length - 10} autres
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Sélectionnez les symptômes principaux pour une analyse précise. Maximum 10 recommandés.
                    </p>
                  </>
                )}
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
                  Lancer l'analyse IA
                  <Stethoscope className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations de débogage */}
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-sm font-semibold mb-2">🔍 Informations système :</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">Symptômes disponibles :</span>{" "}
            {symptomsList.length}
          </div>
          <div>
            <span className="font-medium">Symptômes sélectionnés :</span>{" "}
            {selectedSymptoms.length}
          </div>
          <div>
            <span className="font-medium">Backend :</span>{" "}
            {backendStatus === "checking" && "🔄 Vérification..."}
            {backendStatus === "connected" && "✅ Connecté"}
            {backendStatus === "error" && "❌ Non disponible"}
          </div>
          <div>
            <span className="font-medium">Mode :</span>{" "}
            {backendStatus === "connected" ? "Production" : "Démonstration"}
          </div>
        </div>
      </div>
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
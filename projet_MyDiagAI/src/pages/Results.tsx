// src/pages/Results.tsx
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle2, Info, Download, AlertTriangle, Stethoscope, TestTube, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getDiseases } from "@/services/api";
import { generateDiagnosticPDF } from "@/lib/pdfGenerator";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupération des données de Diagnostic.tsx
  const { 
    diagnosisResult, 
    patientInfo, 
    selectedSymptoms, 
    isDemo = false 
  } = location.state || {};
  
  const [availableDiseases, setAvailableDiseases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // DÉBOGAGE : Afficher les données reçues
  useEffect(() => {
    console.log("=".repeat(60));
    console.log("🔍 RESULTS.TSX - DONNÉES REÇUES");
    console.log("=".repeat(60));
    console.log("📍 location.state:", location.state);
    console.log("📍 diagnosisResult:", diagnosisResult);
    console.log("📍 patientInfo:", patientInfo);
    console.log("📍 selectedSymptoms:", selectedSymptoms);
    console.log("📍 isDemo:", isDemo);
    
    if (diagnosisResult) {
      console.log("\n📦 STRUCTURE DE diagnosisResult:");
      console.log("   - success:", diagnosisResult.success);
      console.log("   - diagnostic_assistant:", diagnosisResult.diagnostic_assistant);
      console.log("   - results:", diagnosisResult.diagnostic_assistant?.results);
      console.log("   - patient_info:", diagnosisResult.diagnostic_assistant?.patient_info);
      
      if (diagnosisResult.diagnostic_assistant?.results) {
        console.log(`\n📊 NOMBRE DE RÉSULTATS: ${diagnosisResult.diagnostic_assistant.results.length}`);
        diagnosisResult.diagnostic_assistant.results.forEach((r: any, i: number) => {
          console.log(`   ${i+1}. ${r.disease} - ${r.probability_percent}%`);
        });
      }
    }
    console.log("=".repeat(60));
    
    // Sauvegarder pour affichage dans le composant
    setDebugInfo({
      hasDiagnosisResult: !!diagnosisResult,
      hasPatientInfo: !!patientInfo,
      hasSymptoms: !!(selectedSymptoms && selectedSymptoms.length > 0),
      resultCount: diagnosisResult?.diagnostic_assistant?.results?.length || 0,
      firstDisease: diagnosisResult?.diagnostic_assistant?.results?.[0]?.disease || "Aucun"
    });
    
    // Transformer les données
    if (diagnosisResult) {
      const transformed = transformDiagnosticData(diagnosisResult);
      setDiagnosticData(transformed);
      console.log("🔄 Données transformées:", transformed);
    }
  }, [location.state]);

  // Charger la liste des maladies
  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    try {
      setIsLoading(true);
      const data = await getDiseases();
      if (data.diseases && Array.isArray(data.diseases)) {
        setAvailableDiseases(data.diseases);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des maladies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de transformation des données API
  const transformDiagnosticData = (apiData: any) => {
    if (!apiData) return null;
    
    console.log("🔄 Transformation des données reçues:", apiData);
    
    // FORMAT 1: Réponse de votre backend (avec diagnostic_assistant)
    if (apiData.diagnostic_assistant && apiData.diagnostic_assistant.results) {
      console.log("✅ Format 1 détecté (avec diagnostic_assistant)");
      return {
        results: apiData.diagnostic_assistant.results,
        patient_info: apiData.diagnostic_assistant.patient_info || patientInfo,
        statistics: calculateStatistics(apiData.diagnostic_assistant.results, selectedSymptoms),
        disclaimer: apiData.diagnostic_assistant.disclaimer || "Résultat du diagnostic IA",
        mode: 'production'
      };
    }
    
    // FORMAT 2: Réponse directe avec results
    if (apiData.results && Array.isArray(apiData.results)) {
      console.log("✅ Format 2 détecté (results direct)");
      return {
        results: apiData.results,
        patient_info: apiData.patient_info || patientInfo,
        statistics: calculateStatistics(apiData.results, selectedSymptoms),
        disclaimer: apiData.disclaimer || "Résultat du diagnostic IA",
        mode: 'production'
      };
    }
    
    // FORMAT 3: Réponse avec succès et diagnostic_assistant
    if (apiData.success && apiData.diagnostic_assistant) {
      console.log("✅ Format 3 détecté (success + diagnostic_assistant)");
      return {
        results: apiData.diagnostic_assistant.results || [],
        patient_info: apiData.diagnostic_assistant.patient_info || patientInfo,
        statistics: calculateStatistics(apiData.diagnostic_assistant.results || [], selectedSymptoms),
        disclaimer: apiData.diagnostic_assistant.disclaimer || "Résultat du diagnostic IA",
        mode: 'production'
      };
    }
    
    // Format inconnu
    console.warn("⚠️ Format API non reconnu, utilisation du mode simulation");
    console.warn("Données reçues:", apiData);
    
    return {
      results: [
        {
          disease: "Grippe saisonnière",
          probability_percent: 78,
          probability_decimal: 0.78,
          confidence_level: "ÉLEVÉE - Diagnostic plausible",
          medical_action: "Diagnostic principal à considérer",
          specific_guidance: "Infection virale commune des voies respiratoires",
          suggested_tests: ["Test PCR", "Numération sanguine"],
          risk_level: "Modéré",
          recommendations: [
            "Repos et hydratation",
            "Médicaments antipyrétiques si nécessaire",
            "Surveillance des symptômes pendant 7-10 jours",
          ]
        },
      ],
      patient_info: patientInfo,
      statistics: {
        symptoms_count: selectedSymptoms?.length || 0,
        top_diagnosis: "Grippe saisonnière",
        top_probability: 78,
        differential_diagnosis_count: 1,
        high_probability_count: 1,
        timestamp: new Date().toISOString()
      },
      disclaimer: "Mode simulation - Données de démonstration",
      mode: 'simulation'
    };
  };

  // Fonction pour calculer les statistiques
  const calculateStatistics = (results: any[], symptoms: string[] = []) => {
    if (!results || results.length === 0) {
      return {
        symptoms_count: symptoms.length,
        top_diagnosis: "Non déterminé",
        top_probability: 0,
        differential_diagnosis_count: 0,
        high_probability_count: 0,
        timestamp: new Date().toISOString()
      };
    }

    const sortedResults = [...results].sort((a, b) => 
      (b.probability_percent || 0) - (a.probability_percent || 0)
    );

    return {
      symptoms_count: symptoms.length,
      top_diagnosis: sortedResults[0]?.disease || "Non déterminé",
      top_probability: sortedResults[0]?.probability_percent || 0,
      differential_diagnosis_count: results.length,
      high_probability_count: results.filter(r => (r.probability_percent || 0) > 70).length,
      timestamp: new Date().toISOString()
    };
  };

  // Obtenir les résultats à afficher
  const getResults = () => {
    if (diagnosticData?.results) {
      return diagnosticData.results;
    }
    
    if (diagnosisResult?.diagnostic_assistant?.results) {
      return diagnosisResult.diagnostic_assistant.results;
    }
    
    return [];
  };

  // Obtenir les statistiques
  const getStats = () => {
    if (diagnosticData?.statistics) {
      return diagnosticData.statistics;
    }
    
    const results = getResults();
    return calculateStatistics(results, selectedSymptoms);
  };

  const results = getResults();
  const stats = getStats();
  const isSimulation = isDemo || diagnosticData?.mode === 'simulation';

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      'Élevé': "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200",
      'Modéré': "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200",
      'Faible': "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200",
      'High': "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200",
      'Medium': "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200",
      'Low': "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200",
    };
    return colors[risk] || "bg-gray-100 text-gray-800";
  };

  const getConfidenceIcon = (confidence: string) => {
    if (confidence?.includes('TRÈS ÉLEVÉ') || confidence?.includes('VERY HIGH')) 
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (confidence?.includes('ÉLEVÉ') || confidence?.includes('HIGH')) 
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    if (confidence?.includes('MODÉRÉ') || confidence?.includes('MODERATE') || confidence?.includes('MODÉRÉE')) 
      return <Info className="h-5 w-5 text-blue-600" />;
    return <Stethoscope className="h-5 w-5 text-gray-600" />;
  };

  const handleDownloadPDF = () => {
    if (patientInfo) {
      try {
        const pdfResults = results.map((result: any) => ({
          disease: result.disease,
          probability: result.probability_percent || result.probability_decimal * 100,
          severity: result.risk_level,
          description: result.specific_guidance || result.description || "",
          recommendations: result.recommendations || [result.medical_action]
        }));

        generateDiagnosticPDF(
          {
            name: patientInfo.name,
            age: patientInfo.age?.toString() || "",
            gender: patientInfo.gender,
            genre: undefined
          },
          selectedSymptoms || [],
          pdfResults
        );
        
        toast({
          title: "PDF généré",
          description: "Le rapport de diagnostic a été téléchargé",
        });
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        toast({
          title: "Erreur",
          description: "Impossible de générer le PDF",
          variant: "destructive",
        });
      }
    }
  };

  const translateGender = (gender: string) => {
    const translations: Record<string, string> = {
      'M': 'Homme',
      'F': 'Femme',
      'male': 'Homme',
      'female': 'Femme',
      'Male': 'Homme',
      'Female': 'Femme'
    };
    return translations[gender] || gender || 'Non spécifié';
  };

  const formatSymptomName = (symptom: string) => {
    return symptom
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BANDEAU DE DÉBOGAGE - À SUPPRIMER PLUS TARD */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-800 text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              🔍 INFORMATIONS DE DÉBOGAGE
            </CardTitle>
          </CardHeader>
          <CardContent>
            
              <div>
                <p className="font-semibold">Aperçu:</p>
                <p className="text-xs mt-1 bg-white p-2 rounded">
                  {results.length > 0 
                    ? `Premier diagnostic: ${results[0].disease} (${results[0].probability_percent}%)` 
                    : "Aucun résultat à afficher"}
                </p>
              </div>
          
            
            {/* Données brutes (repliables) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-yellow-700">
                Voir les données brutes
              </summary>
              <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-60">
                {JSON.stringify({ diagnosisResult, patientInfo, selectedSymptoms }, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Résultats du Diagnostic</h1>
              {isSimulation && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Mode Simulation
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              Analyse {isSimulation ? 'simulée' : 'réelle'} - Assistant pour médecin
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
            <Button variant="outline" onClick={() => navigate("/diagnostic")}>
              Nouveau diagnostic
            </Button>
          </div>
        </div>

        {/* Bandeau d'information */}
        {diagnosticData?.disclaimer && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {diagnosticData.disclaimer}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.symptoms_count}</p>
                <p className="text-sm text-muted-foreground">Symptômes analysés</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.differential_diagnosis_count}</p>
                <p className="text-sm text-muted-foreground">Diagnostics différentiels</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{stats.high_probability_count}</p>
                <p className="text-sm text-muted-foreground">Probabilités élevées</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.top_probability}%</p>
                <p className="text-sm text-muted-foreground">Probabilité maximale</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations du patient */}
        {patientInfo && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Fiche Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nom</p>
                  <p className="font-semibold text-lg">{patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Âge</p>
                  <p className="font-semibold text-lg">{patientInfo.age} ans</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Genre</p>
                  <p className="font-semibold text-lg">{translateGender(patientInfo.gender)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date d'analyse</p>
                  <p className="font-semibold text-lg">
                    {new Date(stats.timestamp).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {/* Affichage des symptômes */}
              {selectedSymptoms && selectedSymptoms.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Symptômes rapportés</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {formatSymptomName(symptom)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {patientInfo.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes cliniques</p>
                  <p className="text-sm">{patientInfo.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Résultats du diagnostic */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Diagnostics différentiels</h2>
          
          {results.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun résultat disponible</h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun diagnostic n'a été généré. Vérifiez les données de débogage ci-dessus.
                  </p>
                  <Button onClick={() => navigate("/diagnostic")}>
                    Retour au diagnostic
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            results.map((result: any, index: number) => (
              <Card
                key={index}
                className="shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-primary"
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getConfidenceIcon(result.confidence_level)}
                        <CardTitle className="text-2xl">
                          {result.disease || "Diagnostic"}
                        </CardTitle>
                        {index === 0 && (
                          <Badge className="bg-primary text-primary-foreground">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {result.risk_level && (
                          <Badge className={getRiskColor(result.risk_level)}>
                            Risque: {result.risk_level}
                          </Badge>
                        )}
                        {result.confidence_level && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {typeof result.confidence_level === 'string' 
                              ? result.confidence_level.split(' - ')[0] 
                              : 'Niveau'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Probabilité */}
                    <div className="text-center min-w-[120px]">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {result.probability_percent || Math.round((result.probability_decimal || 0) * 100)}%
                      </div>
                      <Progress 
                        value={result.probability_percent || (result.probability_decimal || 0) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Probabilité
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Conseils médicaux */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {result.medical_action && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Action recommandée
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {result.medical_action}
                        </p>
                      </div>
                    )}
                    
                    {(result.specific_guidance || result.description) && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          Conseil spécifique
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {result.specific_guidance || result.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Examens suggérés */}
                  {result.suggested_tests && result.suggested_tests.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-purple-600" />
                        Examens complémentaires suggérés
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.suggested_tests.map((test: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-sm">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recommandations */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Recommandations</h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pied de page avec actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/dashboard")}
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
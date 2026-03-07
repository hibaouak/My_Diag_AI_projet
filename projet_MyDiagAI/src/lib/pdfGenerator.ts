//lib/pdfGenerator.ts
import { jsPDF } from "jspdf";

interface PatientData {
  name: string;
  age: string;
  gender: string;
}

interface DiagnosticResult {
  disease: string;
  probability: number;
  severity: string;
  description: string;
  recommendations: string[];
}

export const generateDiagnosticPDF = (
  patient: PatientData,
  symptoms: string[],
  results: DiagnosticResult[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Primary blue
  doc.text("MyDiagAI", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Rapport de Diagnostic", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Patient Information
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Informations du Patient", 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text(`Nom: ${patient.name}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Âge: ${patient.age} ans`, 25, yPosition);
  yPosition += 7;
  const genderText = patient.gender === "male" ? "Homme" : patient.gender === "female" ? "Femme" : "Autre";
  doc.text(`Genre: ${genderText}`, 25, yPosition);
  yPosition += 12;

  // Selected Symptoms
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Symptômes Sélectionnés", 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  
  // Map symptom IDs to French labels
  const symptomLabels: Record<string, string> = {
    fever: "Fièvre",
    cough: "Toux",
    headache: "Mal de tête",
    fatigue: "Fatigue",
    nausea: "Nausée",
    vomiting: "Vomissements",
    diarrhea: "Diarrhée",
    rash: "Éruption cutanée",
    "sore-throat": "Mal de gorge",
    "shortness-of-breath": "Essoufflement",
    "chest-pain": "Douleur thoracique",
    dizziness: "Étourdissement",
    "joint-pain": "Douleurs articulaires",
    "muscle-pain": "Douleurs musculaires",
    "loss-of-smell": "Perte d'odorat",
    "loss-of-taste": "Perte de goût",
    "runny-nose": "Nez qui coule",
    "abdominal-pain": "Douleur abdominale",
    chills: "Frissons",
    thirst: "Soif",
    sensitivity: "Sensibilité",
    pain: "Douleur",
    itching: "Démangeaison",
    "loss-of-appetite": "Perte d'appétit",
    "other-disorders": "Troubles divers",
  };

  symptoms.forEach((symptom) => {
    doc.text(`• ${symptomLabels[symptom] || symptom}`, 25, yPosition);
    yPosition += 6;
  });

  yPosition += 8;

  // Diagnostic Results
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Résultats du Diagnostic", 20, yPosition);
  yPosition += 10;

  results.forEach((result, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`${index + 1}. ${result.disease}`, 25, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Probabilité: ${result.probability}% | Sévérité: ${result.severity}`, 30, yPosition);
    yPosition += 6;

    // Description
    const descLines = doc.splitTextToSize(result.description, pageWidth - 60);
    doc.text(descLines, 30, yPosition);
    yPosition += descLines.length * 5 + 5;

    // Recommendations
    doc.setFont(undefined, "bold");
    doc.text("Recommandations:", 30, yPosition);
    yPosition += 6;
    doc.setFont(undefined, "normal");

    result.recommendations.forEach((rec) => {
      const recLines = doc.splitTextToSize(`• ${rec}`, pageWidth - 65);
      doc.text(recLines, 35, yPosition);
      yPosition += recLines.length * 5 + 2;
    });

    yPosition += 8;
  });

  // Footer
  const finalY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Ces résultats permettent au médecin d'établir un diagnostic plus précis. ",
    pageWidth / 2,
    finalY,
    { align: "center" }
  );

  // Generate filename with date
  const date = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
  const filename = `Diagnostic_${patient.name.replace(/\s+/g, "_")}_${date}.pdf`;

  // Save the PDF
  doc.save(filename);
};

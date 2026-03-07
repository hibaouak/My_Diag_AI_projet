// lib/pdfGenerator.ts
import { jsPDF } from "jspdf";


interface PatientData {
  genre: any;
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
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Couleurs professionnelles
  const primaryColor = [41, 128, 185] as [number, number, number]; // Bleu professionnel
  const secondaryColor = [52, 73, 94] as [number, number, number]; // Gris foncé
  const accentColor = [46, 204, 113] as [number, number, number]; // Vert pour succès
  const warningColor = [241, 196, 15] as [number, number, number]; // Jaune pour avertissement
  const dangerColor = [231, 76, 60] as [number, number, number]; // Rouge pour sévérité élevée

  // ==================== EN-TÊTE ====================
  
  // Bandeau supérieur
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Logo / Titre principal
  doc.setFontSize(28);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("MyDiagAI", 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Rapport de Diagnostic Médical", 20, 35);
  
  // Date et numéro de rapport
  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = today.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${dateStr} à ${timeStr}`, pageWidth - 20, 25, { align: "right" });
  doc.text(`Rapport N°: DIAG-${today.getTime().toString().slice(-8)}`, pageWidth - 20, 35, { align: "right" });

  yPosition = 50;

  // ==================== INFORMATIONS PATIENT ====================
  
  // Titre de section
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, yPosition - 5, 5, 20, "F");
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS PATIENT", 30, yPosition + 5);
  yPosition += 15;

  // Cadre des infos patient
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(20, yPosition, pageWidth - 40, 35, 3, 3, "FD");
  
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  
  const genderText = patient.gender === "male" ? "Homme" : patient.gender === "female" ? "Femme" : "Autre";
  
  doc.text(`Nom: ${patient.name}`, 30, yPosition + 10);
  doc.text(`Âge: ${patient.age} ans`, 30, yPosition + 20);
  doc.text(`Genre: ${patient.gender}`, 30, yPosition + 30);
  
  yPosition += 45;

  // ==================== SYMPTÔMES ====================
  
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, yPosition - 5, 5, 20, "F");
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("SYMPTÔMES SIGNALÉS", 30, yPosition + 5);
  yPosition += 15;

  // Mapping des symptômes
  const symptomLabels: Record<string, string> = {
    "anxiety and nervousness": "Anxiété et nervosité",
    "depression": "Dépression",
    "shortness of breath": "Essoufflement",
    "sharp chest pain": "Douleur thoracique aiguë",
    "dizziness": "Étourdissements",
    "insomnia": "Insomnie",
    "palpitations": "Palpitations",
    "irregular heartbeat": "Battements cardiaques irréguliers",
    "breathing fast": "Respiration rapide",
    "hoarse voice": "Voix enrouée",
    "sore throat": "Mal de gorge",
    "difficulty speaking": "Difficulté à parler",
    "cough": "Toux",
    "nasal congestion": "Congestion nasale",
    "throat swelling": "Gonflement de la gorge",
    "difficulty in swallowing": "Difficulté à avaler",
    "vomiting": "Vomissements",
    "headache": "Mal de tête",
    "nausea": "Nausée",
    "diarrhea": "Diarrhée",
    "painful urination": "Miction douloureuse",
    "frequent urination": "Mictions fréquentes",
    "blood in urine": "Sang dans les urines",
    "hand or finger pain": "Douleur main/doigts",
    "arm pain": "Douleur au bras",
    "back pain": "Douleur dorsale",
    "neck pain": "Douleur cervicale",
    "low back pain": "Lombalgie",
    "knee pain": "Douleur au genou",
    "foot or toe pain": "Douleur pied/orteils",
    "ankle pain": "Douleur à la cheville",
    "joint pain": "Douleur articulaire",
    "muscle pain": "Douleur musculaire",
    "muscle stiffness or tightness": "Raideur musculaire",
    "fatigue": "Fatigue",
    "fever": "Fièvre",
    "chills": "Frissons",
    "weight gain": "Prise de poids",
    "recent weight loss": "Perte de poids récente",
    "decreased appetite": "Perte d'appétit",
    "excessive appetite": "Appétit excessif",
    "swollen lymph nodes": "Ganglions enflés",
    "skin rash": "Éruption cutanée",
    "skin lesion": "Lésion cutanée",
    "acne or pimples": "Acné/boutons",
    "mouth ulcer": "Ulcère buccal",
    "eye redness": "Rougeur oculaire",
    "diminished vision": "Vision diminuée",
    "double vision": "Vision double",
    "seizures": "Convulsions"
  };

  // Afficher les symptômes en colonnes
  const symptomsList = symptoms.map(s => `• ${symptomLabels[s] || s}`);
  const midPoint = Math.ceil(symptomsList.length / 2);
  const leftColumn = symptomsList.slice(0, midPoint);
  const rightColumn = symptomsList.slice(midPoint);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");

  let maxHeight = 0;
  leftColumn.forEach((symptom, index) => {
    doc.text(symptom, 25, yPosition + (index * 5));
    maxHeight = Math.max(maxHeight, yPosition + ((index + 1) * 5));
  });

  rightColumn.forEach((symptom, index) => {
    doc.text(symptom, pageWidth / 2, yPosition + (index * 5));
    maxHeight = Math.max(maxHeight, yPosition + ((index + 1) * 5));
  });

  yPosition = maxHeight + 15;

  // ==================== RÉSULTATS DU DIAGNOSTIC ====================
  
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, yPosition - 5, 5, 20, "F");
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("RÉSULTATS DU DIAGNOSTIC", 30, yPosition + 5);
  yPosition += 20;

  results.forEach((result, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
      
      // Ajouter un en-tête de page
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("MyDiagAI - Suite du rapport", pageWidth / 2, 10, { align: "center" });
      yPosition = 25;
    }

    // Déterminer la couleur selon la sévérité
    let severityColor = accentColor;
    if (result.severity.toLowerCase().includes("haut") || result.severity.toLowerCase().includes("élevé")) {
      severityColor = dangerColor;
    } else if (result.severity.toLowerCase().includes("moyen")) {
      severityColor = warningColor;
    }

    // Cadre pour chaque diagnostic
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(20, yPosition, pageWidth - 40, 10, 2, 2, "FD");
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${result.disease}`, 25, yPosition + 7);
    yPosition += 15;

    // Probabilité et sévérité
    doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
    doc.roundedRect(25, yPosition - 3, 35, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Prob: ${result.probability}%`, 28, yPosition + 2);
    
    doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
    doc.roundedRect(65, yPosition - 3, 45, 8, 2, 2, "F");
    doc.text(`Sévérité: ${result.severity}`, 68, yPosition + 2);
    yPosition += 12;

    // Description
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(result.description, pageWidth - 60);
    doc.text(descLines, 25, yPosition);
    yPosition += descLines.length * 5 + 5;

    // Recommandations
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Recommandations:", 25, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");

    result.recommendations.forEach((rec, i) => {
      const recLines = doc.splitTextToSize(`• ${rec}`, pageWidth - 70);
      doc.text(recLines, 30, yPosition + (i * 5));
    });

    yPosition += result.recommendations.length * 6 + 10;

    // Ligne de séparation
    if (index < results.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(25, yPosition - 5, pageWidth - 25, yPosition - 5);
    }
  });

  // ==================== RECOMMANDATIONS GÉNÉRALES ====================
  
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 10;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(20, yPosition - 5, 5, 20, "F");
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("RECOMMANDATIONS GÉNÉRALES", 30, yPosition + 5);
  yPosition += 20;

  // Nouvelles recommandations générales plus pertinentes
  const generalRecommendations = [
    "Poursuivre l’évaluation clinique du patient et adapter la prise en charge en fonction des résultats de l’examen clinique, des antécédents médicaux et des examens complémentaires si nécessaire.",
    "En cas de symptômes d’urgence (ex : douleur thoracique aiguë, essoufflement sévère, confusion, convulsions), orienter immédiatement le patient vers les services d’urgence (15 ou 112).",
    "Pour les pathologies à sévérité élevée, envisager une prise en charge rapide et multidisciplinaire, incluant éventuellement une hospitalisation.",
    "Pour les pathologies à sévérité moyenne, planifier un suivi rapproché et envisager des examens complémentaires pour affiner le diagnostic.",
    "Pour les pathologies à sévérité faible, recommander des mesures de prévention, de surveillance et de gestion des symptômes à domicile, tout en restant vigilant à l’évolution clinique du patient."
  ];

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  
  // Afficher les recommandations avec des puces
  generalRecommendations.forEach((rec, i) => {
    // Mettre en gras les recommandations d'urgence
    if (rec.includes("urgence") || rec.includes("15") || rec.includes("112")) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
    }
    
    const recLines = doc.splitTextToSize(`✓ ${rec}`, pageWidth - 50);
    doc.text(recLines, 30, yPosition + (i * 7));
  });

  yPosition += generalRecommendations.length * 7 + 15;

  // ==================== INFORMATIONS COMPLÉMENTAIRES ====================
  
  doc.setFillColor(warningColor[0], warningColor[1], warningColor[2]);
  doc.rect(20, yPosition - 5, 5, 20, "F");
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS IMPORTANTES", 30, yPosition + 5);
  yPosition += 20;

  const importantInfo = [
    "Ce diagnostic est une suggestion basée sur l'intelligence artificielle et ne remplace pas l'expertise d'un professionnel de santé.",
    "Certaines pathologies peuvent présenter des symptômes similaires. Seul un médecin peut établir un diagnostic précis après examen clinique et examens complémentaires.",
    "Les probabilités indiquées sont des estimations statistiques et ne constituent pas une certitude médicale.",
    "Conservez ce rapport pour le présenter à votre médecin lors de votre consultation."
  ];

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "italic");
  
  importantInfo.forEach((info, i) => {
    const infoLines = doc.splitTextToSize(`ℹ️ ${info}`, pageWidth - 50);
    doc.text(infoLines, 30, yPosition + (i * 6));
  });

  // ==================== PIED DE PAGE ====================
  
  const footerY = doc.internal.pageSize.getHeight() - 15;
  
  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Document généré par MyDiagAI - Pour usage médical uniquement. Ne se substitue pas à une consultation médicale.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // Générer le nom du fichier
  const date = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
  const filename = `Diagnostic_${patient.name.replace(/\s+/g, "_")}_${date}.pdf`;

  // Sauvegarder le PDF
  doc.save(filename);
};
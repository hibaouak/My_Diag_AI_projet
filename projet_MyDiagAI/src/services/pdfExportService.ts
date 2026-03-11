// src/services/pdfExportService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SearchStats {
  total_searches: number;
  average_confidence: number;
  top_specialties: Array<{
    specialty: string;
    count: number;
    percentage: number;
  }>;
  recent_searches: Array<{
    specialty: string;
    disease: string;
    date: string;
    confidence: number;
  }>;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  clinic: string;
  rating?: number;
}

export const exportStatsToPDF = (
  stats: SearchStats,
  doctorsBySpecialty: Record<string, Doctor[]>,
  userName: string,
  selectedSpecialty?: string | null
): void => {
  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // ===== PAGE 1: EN-TÊTE =====
    doc.setFontSize(22);
    doc.setTextColor(47, 158, 149);
    doc.text('MyDiagAI', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text('Statistiques Patient', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Généré le ${dateStr} pour ${userName}`, pageWidth / 2, 38, { align: 'center' });
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, pageWidth - 20, 45);
    
    // ===== STATISTIQUES GLOBALES =====
    doc.setFontSize(14);
    doc.setTextColor(47, 158, 149);
    doc.text('Résumé global', 20, 55);
    
    const globalData = [
      ['Recherches totales', stats.total_searches.toString()],
      ['Précision moyenne', `${stats.average_confidence}%`],
      ['Spécialités consultées', stats.top_specialties.length.toString()],
      ['Dernière recherche', stats.recent_searches[0]?.specialty || '-']
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Indicateur', 'Valeur']],
      body: globalData,
      theme: 'striped',
      headStyles: { fillColor: [47, 158, 149], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 248, 245] },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'center' }
      },
      margin: { left: 20, right: 20 }
    });
    
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // ===== TOP SPÉCIALITÉS =====
    doc.setFontSize(14);
    doc.setTextColor(47, 158, 149);
    doc.text('Top spécialités recherchées', 20, finalY);
    
    finalY += 5;
    
    if (stats.top_specialties.length > 0) {
      const specialtiesData = stats.top_specialties.map((item, index) => [
        `${index + 1}`,
        item.specialty,
        item.count.toString(),
        `${Math.round(item.percentage)}%`
      ]);
      
      autoTable(doc, {
        startY: finalY,
        head: [['#', 'Spécialité', 'Nombre', 'Pourcentage']],
        body: specialtiesData,
        theme: 'striped',
        headStyles: { fillColor: [47, 158, 149], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 248, 245] },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });
      
      finalY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('Aucune donnée disponible', 25, finalY + 5);
      finalY += 15;
    }
    
    // ===== RECHERCHES RÉCENTES =====
    // Vérifier si on a besoin d'une nouvelle page
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(47, 158, 149);
    doc.text('Recherches récentes', 20, finalY);
    
    finalY += 5;
    
    if (stats.recent_searches.length > 0) {
      const recentData = stats.recent_searches.slice(0, 5).map(search => {
        const date = new Date(search.date);
        const dateStr = date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return [
          search.specialty,
          search.disease,
          dateStr,
          `${search.confidence}%`
        ];
      });
      
      autoTable(doc, {
        startY: finalY,
        head: [['Spécialité', 'Maladie', 'Date', 'Confiance']],
        body: recentData,
        theme: 'striped',
        headStyles: { fillColor: [47, 158, 149], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 248, 245] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });
      
      finalY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('Aucune recherche récente', 25, finalY + 5);
      finalY += 15;
    }
    
    // ===== MÉDECINS PAR SPÉCIALITÉ (si une spécialité est sélectionnée) =====
    if (selectedSpecialty && doctorsBySpecialty[selectedSpecialty]) {
      // Vérifier si on a besoin d'une nouvelle page
      if (finalY > 230) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(47, 158, 149);
      doc.text(`Médecins - ${selectedSpecialty}`, 20, finalY);
      
      finalY += 10;
      
      const doctors = doctorsBySpecialty[selectedSpecialty];
      const doctorsData = doctors.map(doc => [
        doc.name,
        doc.city,
        doc.phone,
        doc.clinic,
        doc.rating ? doc.rating.toString() : 'N/A'
      ]);
      
      autoTable(doc, {
        startY: finalY,
        head: [['Nom', 'Ville', 'Téléphone', 'Clinique', 'Note']],
        body: doctorsData,
        theme: 'striped',
        headStyles: { fillColor: [47, 158, 149], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 248, 245] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // ===== PIED DE PAGE =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} sur ${pageCount} - Généré par MyDiagAI`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Télécharger le PDF
    doc.save(`statistiques_mydiagai_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};
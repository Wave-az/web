import jsPDF from "jspdf";
import type { PolygonData } from "../components/GoogleMap";
import type { AnalysisResponse } from "../App";

type PDFReportData = {
  projectTitle: string;
  polygons: PolygonData[];
  locationSearch: string;
  latitude: string;
  longitude: string;
  dateRange: {
    fromYear: string;
    fromMonth: string;
    fromDay: string;
    toYear: string;
    toMonth: string;
    toDay: string;
  };
  mapType: "roadmap" | "satellite" | "terrain" | "hybrid";
  analysis?: Record<string, AnalysisResponse>; // Analysis per polygon ID
  units: "metric" | "imperial";
};

export function generatePDFReport(data: PDFReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;
  let currentPage = 1;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPos + requiredSpace > pageHeight - margin - 15) {
      doc.addPage();
      currentPage++;
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to format date
  const formatDate = (year: string, month: string, day: string): string => {
    if (!year || !month || !day) return "Not set";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex] || month} ${day}, ${year}`;
  };

  // Helper function to get polygon coordinates as array
  const getPolygonCoordinates = (poly: PolygonData): Array<{ lat: number; lng: number }> => {
    const path = poly.polygon?.getPath?.();
    if (path && typeof path.getLength === "function") {
      const coords: Array<{ lat: number; lng: number }> = [];
      path.forEach((latLng) => {
        coords.push({ lat: latLng.lat(), lng: latLng.lng() });
      });
      return coords;
    }
    if (poly.coordinates?.length) {
      return poly.coordinates;
    }
    return [];
  };

  // Helper function to calculate polygon area (approximate)
  const calculatePolygonArea = (coords: Array<{ lat: number; lng: number }>): number => {
    if (coords.length < 3) return 0;
    
    // Simplified area calculation using spherical excess formula
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lng * coords[j].lat;
      area -= coords[j].lng * coords[i].lat;
    }
    area = Math.abs(area) / 2;
    
    // Convert to square kilometers (rough approximation)
    // 1 degree lat ≈ 111 km, 1 degree lng ≈ 111 km * cos(lat)
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const kmPerDegreeLat = 111;
    const kmPerDegreeLng = 111 * Math.cos((avgLat * Math.PI) / 180);
    
    return area * kmPerDegreeLat * kmPerDegreeLng;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, fontSize: number = 16): void => {
    checkPageBreak(25);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, yPos);
    yPos += 10;
    
    // Underline
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 8;
  };

  // Helper function to add label-value pair
  const addLabelValue = (label: string, value: string, indent: number = 0): void => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin + indent, yPos);
    doc.setFont("helvetica", "normal");
    const labelWidth = doc.getTextWidth(label + ": ");
    doc.text(value, margin + indent + labelWidth, yPos);
    yPos += 7;
  };

  // Helper function to add coordinate table
  const addCoordinateTable = (coords: Array<{ lat: number; lng: number }>, maxRows: number = 10): void => {
    if (coords.length === 0) return;

    checkPageBreak(30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    
    // Table header
    const tableTop = yPos;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, tableTop, contentWidth, 8, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.text("#", margin + 2, tableTop + 6);
    doc.text("Latitude", margin + 15, tableTop + 6);
    doc.text("Longitude", margin + 80, tableTop + 6);
    
    yPos = tableTop + 8;
    
    // Table rows
    const rowsToShow = Math.min(coords.length, maxRows);
    doc.setFont("helvetica", "normal");
    
    for (let i = 0; i < rowsToShow; i++) {
      checkPageBreak(8);
      const isEven = i % 2 === 0;
      if (isEven) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 6, contentWidth, 8, "F");
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(String(i + 1), margin + 2, yPos);
      doc.text(coords[i].lat.toFixed(6), margin + 15, yPos);
      doc.text(coords[i].lng.toFixed(6), margin + 80, yPos);
      yPos += 8;
    }
    
    if (coords.length > maxRows) {
      checkPageBreak(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`... and ${coords.length - maxRows} more coordinates`, margin + 5, yPos);
      yPos += 7;
    }
    
    yPos += 5;
  };

  // ============================================
  // COVER PAGE
  // ============================================
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(data.projectTitle || "Project Report", margin, 60, { align: "left", maxWidth: contentWidth });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    margin,
    80
  );
  
  doc.setFontSize(10);
  doc.text(
    `Total Zones: ${data.polygons.length}`,
    margin,
    95
  );
  
  if (data.locationSearch) {
    doc.text(`Location: ${data.locationSearch}`, margin, 105);
  }

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Project Analysis Report",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" }
  );

  // ============================================
  // TABLE OF CONTENTS (if multiple zones)
  // ============================================
  if (data.polygons.length > 1) {
    doc.addPage();
    currentPage++;
    yPos = margin;
    
    addSectionHeader("Table of Contents", 18);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    data.polygons.forEach((poly, index) => {
      checkPageBreak(8);
      doc.text(`${index + 1}. ${poly.name}`, margin + 5, yPos);
      doc.text(`... ${currentPage + index + 1}`, pageWidth - margin - 20, yPos, { align: "right" });
      yPos += 8;
    });
    
    yPos += 10;
  }

  // ============================================
  // PROJECT OVERVIEW
  // ============================================
  doc.addPage();
  currentPage++;
  yPos = margin;
  
  addSectionHeader("Project Overview", 18);
  
  doc.setFontSize(11);
  addLabelValue("Project Name", data.projectTitle);
  addLabelValue("Location", data.locationSearch || "Not specified");
  
  if (data.latitude && data.longitude) {
    addLabelValue("Center Coordinates", `${data.latitude}, ${data.longitude}`);
  }
  
  const fromDate = formatDate(
    data.dateRange.fromYear,
    data.dateRange.fromMonth,
    data.dateRange.fromDay
  );
  const toDate = formatDate(
    data.dateRange.toYear,
    data.dateRange.toMonth,
    data.dateRange.toDay
  );
  addLabelValue("Analysis Period", `${fromDate} - ${toDate}`);
  addLabelValue("Map Type", data.mapType.charAt(0).toUpperCase() + data.mapType.slice(1));
  addLabelValue("Units", data.units.charAt(0).toUpperCase() + data.units.slice(1));
  addLabelValue("Total Zones", String(data.polygons.length));
  
  yPos += 5;

  // ============================================
  // ZONE SECTIONS - ONE PER ZONE
  // ============================================
  data.polygons.forEach((poly, zoneIndex) => {
    doc.addPage();
    currentPage++;
    yPos = margin;

    // Zone Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Zone ${zoneIndex + 1}: ${poly.name}`, margin, yPos);
    yPos += 12;

    // Underline
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(1);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 10;

    // Zone Information Section
    addSectionHeader("Zone Information", 14);
    
    doc.setFontSize(10);
    addLabelValue("Zone Name", poly.name);
    addLabelValue("Zone Type", poly.type.charAt(0).toUpperCase() + poly.type.slice(1));
    addLabelValue("Zone ID", poly.id);
    
    const coords = getPolygonCoordinates(poly);
    if (coords.length > 0) {
      addLabelValue("Number of Vertices", String(coords.length));
      
      // Calculate approximate area
      const area = calculatePolygonArea(coords);
      if (area > 0) {
        const areaText = data.units === "metric" 
          ? `${area.toFixed(2)} km²`
          : `${(area * 0.386102).toFixed(2)} mi²`;
        addLabelValue("Approximate Area", areaText);
      }
    }
    
    if (poly.center) {
      addLabelValue(
        "Center Point",
        `Lat: ${poly.center.lat.toFixed(6)}, Lng: ${poly.center.lng.toFixed(6)}`
      );
    }
    
    yPos += 5;

    // Coordinates Table
    if (coords.length > 0) {
      addSectionHeader("Coordinates", 14);
      addCoordinateTable(coords, 15);
    }

    // Analysis Results for this Zone (if available)
    const zoneAnalysis = data.analysis?.[poly.id];
    if (zoneAnalysis) {
      yPos += 5;
      addSectionHeader("Analysis Results", 14);
      
      const analysis = zoneAnalysis;
      
      // Suitability Score
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Suitability Assessment", margin, yPos);
      yPos += 10;
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 100, 0);
      doc.text(`${analysis.suitability.score}/100`, margin, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      addLabelValue("FAO Classification", analysis.suitability.fao_class, 0);
      yPos += 5;

      // Suitability Components
      checkPageBreak(50);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Suitability Components", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const components = analysis.suitability.components;
      addLabelValue("Moisture Quality", String(components.moisture_quality), 5);
      addLabelValue("Excess Water Quality", String(components.excess_water_quality), 5);
      addLabelValue("Terrain Quality", String(components.terrain_quality), 5);
      addLabelValue("Temperature Quality", String(components.temperature_quality), 5);
      addLabelValue("Accessibility Quality", String(components.accessibility_quality), 5);
      yPos += 5;

      // Risk Assessment
      checkPageBreak(50);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Risk Assessment", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const risks = analysis.risks;
      addLabelValue("Flood Risk", `${risks.flood.score} - ${risks.flood.label}`, 5);
      addLabelValue("Dryness Risk", `${risks.dryness.score} - ${risks.dryness.label}`, 5);
      addLabelValue("Shoreline Risk", `${risks.shoreline.score} - ${risks.shoreline.label}`, 5);
      addLabelValue("Seasonality Risk", `${risks.seasonality.score} - ${risks.seasonality.label}`, 5);
      yPos += 5;

      // Summary
      checkPageBreak(40);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      Object.entries(analysis.summary_panels).forEach(([key, panel]) => {
        checkPageBreak(25);
        doc.setFont("helvetica", "bold");
        doc.text(panel.title, margin + 5, yPos);
        yPos += 7;
        
        doc.setFont("helvetica", "normal");
        panel.bullets.forEach((bullet) => {
          checkPageBreak(7);
          doc.text(`• ${bullet}`, margin + 10, yPos);
          yPos += 6;
        });
        yPos += 3;
      });
    } else if (!data.analysis && zoneIndex === 0) {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("No analysis results available for this zone.", margin, yPos);
      yPos += 10;
    }

    // Zone separator note
    if (zoneIndex < data.polygons.length - 1) {
      checkPageBreak(15);
      yPos += 5;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Continue to Zone ${zoneIndex + 2}: ${data.polygons[zoneIndex + 1]?.name || "Next Zone"}`,
        margin,
        yPos
      );
    }
  });

  // ============================================
  // FOOTER ON ALL PAGES
  // ============================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    
    // Add project name in footer
    doc.text(
      data.projectTitle || "Project Report",
      margin,
      pageHeight - 10
    );
  }

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `${data.projectTitle.replace(/[^a-z0-9]/gi, "_")}_${timestamp}.pdf`;

  // Save PDF
  doc.save(filename);
}

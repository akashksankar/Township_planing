import jsPDF from 'jspdf';
import { TownshipProject, ProjectStats } from '../types/project';
import { calculatePolygonArea, calculatePolylineLength } from './geometry';

export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf';
  pageSize?: 'A4';
  orientation?: 'landscape' | 'portrait';
  scale?: '1:100' | '1:200' | '1:500' | '1:1000' | 'fit';
  includeTitleBlock?: boolean;
  includeLegend?: boolean;
  includeSummary?: boolean;
  includeGrid?: boolean;
}

/**
 * Computes live project statistics.
 */
export function computeProjectStats(project: TownshipProject): ProjectStats {
  const siteArea = calculatePolygonArea(project.site.boundary);
  let sitePerimeter = 0;
  for (let i = 0; i < project.site.boundary.length; i++) {
    const j = (i + 1) % project.site.boundary.length;
    const dx = project.site.boundary[j][0] - project.site.boundary[i][0];
    const dy = project.site.boundary[j][1] - project.site.boundary[i][1];
    sitePerimeter += Math.hypot(dx, dy);
  }

  let roadArea = 0;
  let roadLength = 0;
  for (const road of project.roads) {
    const len = calculatePolylineLength(road.points);
    roadLength += len;
    roadArea += len * road.width;
  }

  let residentialArea = 0;
  let commercialArea = 0;
  let mixedUseArea = 0;
  let publicArea = 0;

  for (const plot of project.plots) {
    const area = calculatePolygonArea(plot.polygon);
    if (plot.landUse === 'residential') residentialArea += area;
    else if (plot.landUse === 'commercial') commercialArea += area;
    else if (plot.landUse === 'mixed_use') mixedUseArea += area;
    else if (plot.landUse === 'public' || plot.landUse === 'institutional') publicArea += area;
  }

  let openSpaceArea = 0;
  for (const park of project.parks) {
    openSpaceArea += calculatePolygonArea(park.polygon);
  }

  let builtUpArea = 0;
  for (const bld of project.buildings) {
    builtUpArea += bld.width * bld.depth;
  }
  for (const fac of project.facilities) {
    builtUpArea += fac.width * fac.depth;
  }

  let parkingSpaces = 0;
  for (const prk of project.parking) {
    if (prk.capacity) {
      parkingSpaces += prk.capacity;
    } else {
      const area = calculatePolygonArea(prk.polygon);
      parkingSpaces += Math.floor(area / 25); // ~25m2 per stall including aisle
    }
  }

  const openSpacePercentage = siteArea > 0 ? (openSpaceArea / siteArea) * 100 : 0;
  const builtUpPercentage = siteArea > 0 ? (builtUpArea / siteArea) * 100 : 0;

  let infraLength = 0;
  for (const inf of project.infrastructure) {
    if (inf.points) {
      infraLength += calculatePolylineLength(inf.points);
    }
  }

  return {
    siteArea,
    sitePerimeter,
    roadArea,
    roadLength,
    residentialArea,
    commercialArea,
    mixedUseArea,
    publicArea,
    openSpaceArea,
    openSpacePercentage,
    builtUpArea,
    builtUpPercentage,
    plotCount: project.plots.length,
    buildingCount: project.buildings.length,
    parkingSpaces,
    treeCount: (project.trees || []).length,
    infraLength
  };
}

/**
 * Downloads a text/JSON file in browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports current plan as SVG string.
 */
export function exportSvgString(
  project: TownshipProject,
  _options: ExportOptions = { format: 'svg' }
): string {
  const svgEl = document.getElementById('township-svg-plan');
  if (!svgEl) return '<svg></svg>';

  // Clone SVG to strip editor UI elements
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const editorOverlays = clone.querySelectorAll('.editor-overlay, .editor-grid, .snap-indicator');
  editorOverlays.forEach(el => el.remove());

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

/**
 * Exports SVG to PNG with high resolution.
 */
export function exportPng(
  project: TownshipProject,
  filename = 'Township_Plan.png',
  dpiScale = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgString = exportSvgString(project);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const width = image.width || 1200;
        const height = image.height || 900;
        canvas.width = width * dpiScale;
        canvas.height = height * dpiScale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
            resolve();
          }
        }, 'image/png');
      };
      image.onerror = err => reject(err);
      image.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates an A4 PDF document with technical title block, legend, and summary.
 */
export async function exportA4Pdf(
  project: TownshipProject,
  options: ExportOptions = { format: 'pdf', orientation: 'landscape', scale: '1:500' }
): Promise<void> {
  const orientation = options.orientation || 'landscape';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = orientation === 'landscape' ? 297 : 210;
  const pageHeight = orientation === 'landscape' ? 210 : 297;
  const margin = 10;

  // Outer Technical Border
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner margin line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.rect(margin + 2, margin + 2, pageWidth - margin * 2 - 4, pageHeight - margin * 2 - 4);

  // Render SVG Plan to canvas and place into PDF
  const svgString = exportSvgString(project);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/png');

        const planWidth = orientation === 'landscape' ? 210 : 180;
        const planHeight = orientation === 'landscape' ? 140 : 160;
        doc.addImage(imgData, 'PNG', margin + 4, margin + 4, planWidth, planHeight);
      }
      URL.revokeObjectURL(blobURL);
      resolve();
    };
    img.onerror = e => {
      URL.revokeObjectURL(blobURL);
      reject(e);
    };
    img.src = blobURL;
  });

  // Title Block (Bottom-Right)
  const tbWidth = orientation === 'landscape' ? 65 : 75;
  const tbHeight = 40;
  const tbX = pageWidth - margin - 2 - tbWidth;
  const tbY = pageHeight - margin - 2 - tbHeight;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.rect(tbX, tbY, tbWidth, tbHeight, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PROJECT:', tbX + 3, tbY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(project.project.name || 'Township Master Plan', tbX + 22, tbY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DRAWING:', tbX + 3, tbY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text('Conceptual Township Layout', tbX + 22, tbY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('SCALE:', tbX + 3, tbY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(project.project.scale || '1:500 (Conceptual)', tbX + 22, tbY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('UNITS:', tbX + 3, tbY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(project.project.units === 'feet' ? 'Feet' : 'Meters', tbX + 22, tbY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', tbX + 3, tbY + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), tbX + 22, tbY + 30);

  doc.setFont('helvetica', 'bold');
  doc.text('STATUS:', tbX + 3, tbY + 36);
  doc.setTextColor(225, 29, 72);
  doc.text('CONCEPTUAL PLANNING', tbX + 22, tbY + 36);

  // Stats block (if summary requested)
  if (options.includeSummary !== false) {
    const stats = computeProjectStats(project);
    const sbX = orientation === 'landscape' ? 220 : margin + 4;
    const sbY = orientation === 'landscape' ? margin + 6 : 180;
    const sbW = orientation === 'landscape' ? 63 : 100;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.rect(sbX, sbY, sbW, 80, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PROJECT METRICS', sbX + 4, sbY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    let currY = sbY + 13;
    const lineSpacing = 5.2;

    const statsLines = [
      `Site Area: ${stats.siteArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²`,
      `Site Perimeter: ${stats.sitePerimeter.toFixed(1)} m`,
      `Road Corridor Area: ${stats.roadArea.toFixed(0)} m²`,
      `Total Road Length: ${stats.roadLength.toFixed(1)} m`,
      `Residential Plots Area: ${stats.residentialArea.toFixed(0)} m²`,
      `Open Space / Parks: ${stats.openSpaceArea.toFixed(0)} m² (${stats.openSpacePercentage.toFixed(1)}%)`,
      `Built-up Footprint: ${stats.builtUpArea.toFixed(0)} m² (${stats.builtUpPercentage.toFixed(1)}%)`,
      `Total Plots: ${stats.plotCount}`,
      `Total Buildings: ${stats.buildingCount}`,
      `Parking Capacity: ${stats.parkingSpaces} spaces`,
      `Planted Trees: ${stats.treeCount}`
    ];

    statsLines.forEach(line => {
      doc.text(line, sbX + 4, currY);
      currY += lineSpacing;
    });
  }

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Disclaimer: Conceptual planning tool — verify dimensions, statutory regulations and civil engineering requirements with a qualified professional.',
    margin + 4,
    pageHeight - margin - 3
  );

  doc.save(`${project.project.name.replace(/\s+/g, '_')}_Plan.pdf`);
}

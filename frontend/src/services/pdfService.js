// Client-side PDF generation (jsPDF + jspdf-autotable + qrcode). Every report
// carries the mandated verification disclaimer and a QR code so a printed
// copy can be traced back to its record.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const BRAND = 'UrbanSense AI — Smart Traffic & Road Safety Command Center';
const DISCLAIMER =
  'This report is system-generated and requires verification by the authorized department before enforcement.';

function addHeader(doc, title, subtitle) {
  doc.setFillColor(9, 12, 17);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(BRAND, 14, 10);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(230, 237, 245);
  doc.text(title, 14, 18);
  if (subtitle) {
    doc.setFontSize(8);
    doc.setTextColor(150, 165, 185);
    doc.text(subtitle, 14, 22.5);
  }
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(120);
    doc.text(DISCLAIMER, 14, 284, { maxWidth: 182 });
    doc.text(`Generated ${new Date().toLocaleString('en-IN')} · Page ${i} of ${pageCount} · DEMO MODE`, 14, 290);
  }
}

async function addQr(doc, value, x = 168, y = 28, size = 28) {
  try {
    const dataUrl = await QRCode.toDataURL(value, { margin: 1, width: 200, color: { dark: '#0f172a', light: '#ffffff' } });
    doc.addImage(dataUrl, 'PNG', x, y, size, size);
    doc.setFontSize(6.5);
    doc.setTextColor(120);
    doc.text('Scan to verify', x + size / 2, y + size + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  } catch {
    // QR generation is best-effort; report still generates without it.
  }
}

function fieldTable(doc, startY, rows) {
  autoTable(doc, {
    startY,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.6 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 50 }, 1: { textColor: [15, 23, 42] } },
    body: rows,
  });
  return doc.lastAutoTable.finalY;
}

export async function generateViolationPdf(violation, vehicle) {
  const doc = new jsPDF();
  addHeader(doc, 'Smart Traffic Violation Report', `Violation ID ${violation.id}`);
  await addQr(doc, `URBANSENSE-VIOLATION:${violation.id}`);

  let y = fieldTable(doc, 32, [
    ['Vehicle Registration', violation.vehicleNumber],
    ['Violation Type', violation.violationType],
    ['Date', new Date(violation.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Time', new Date(violation.timestamp).toLocaleTimeString('en-IN')],
    ['Location', violation.location],
    ['Camera ID', violation.cameraId],
    ['AI Confidence', `${violation.confidence}%`],
    ['Severity', violation.severity],
    ['Verification Status', violation.status],
    ['Previous Violations (this vehicle)', String(vehicle?.totalViolations ?? 0)],
  ]);

  y += 8;
  if (violation.evidenceImage) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Evidence Snapshot', 14, y);
    doc.setFont(undefined, 'normal');
    try {
      doc.addImage(violation.evidenceImage, 'JPEG', 14, y + 3, 85, 48);
    } catch {
      // best-effort image embed
    }
  }
  if (violation.plateImage) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Number Plate', 108, y);
    doc.setFont(undefined, 'normal');
    try {
      doc.addImage(violation.plateImage, 'PNG', 108, y + 3, 55, 16);
    } catch {
      // best-effort image embed
    }
  }

  y += 58;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('AI Analysis', 14, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8.5);
  doc.text(violation.aiAnalysis || 'Automated detection flagged this event for the violation type and location above.', 14, y + 5, { maxWidth: 182 });

  addFooter(doc);
  doc.save(`${violation.id}_Violation_Report.pdf`);
}

export async function generateComplaintPdf(complaint) {
  const doc = new jsPDF();
  addHeader(doc, 'Citizen Complaint Report', `Complaint ID ${complaint.id}`);
  await addQr(doc, `URBANSENSE-COMPLAINT:${complaint.id}`);

  let y = fieldTable(doc, 32, [
    ['Category', complaint.category],
    ['Description', complaint.description],
    ['Location', complaint.location],
    ['Landmark', complaint.landmark || '—'],
    ['Submitted', new Date(complaint.submittedAt).toLocaleString('en-IN')],
    ['Priority', complaint.priority],
    ['Status', complaint.status],
    ['Assigned Department', complaint.department || 'Not yet assigned'],
  ]);

  if (complaint.images?.[0]) {
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Evidence', 14, y);
    doc.setFont(undefined, 'normal');
    try {
      doc.addImage(complaint.images[0], 'JPEG', 14, y + 3, 85, 48);
    } catch {
      // best-effort image embed
    }
  }

  if (complaint.resolution) {
    autoTable(doc, {
      startY: y + 58,
      head: [['Resolution Notes', 'Resolved On']],
      body: [[complaint.resolution.notes, new Date(complaint.resolution.resolvedAt).toLocaleString('en-IN')]],
      styles: { fontSize: 8.5 },
    });
  }

  addFooter(doc);
  doc.save(`${complaint.id}_Complaint_Report.pdf`);
}

// Generic tabular report — daily/weekly/monthly summaries, violation
// summaries, vehicle history, department performance, etc.
export async function generateTablePdf({ title, subtitle, columns, rows, filtersSummary }) {
  const doc = new jsPDF();
  addHeader(doc, title, subtitle);

  let startY = 30;
  if (filtersSummary) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filters: ${filtersSummary}`, 14, startY);
    doc.setTextColor(0, 0, 0);
    startY += 5;
  }

  autoTable(doc, {
    startY,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => (c.value ? c.value(row) : row[c.key]))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  addFooter(doc);
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

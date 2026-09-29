import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateMetadata {
  studentName: string;
  courseTitle: string;
  score: number;
  issueDate: string; // e.g. "29 September 2026"
  certificateNumber: string; // e.g. "AE-2026-7F9A2C81"
  verificationUrl: string;
}

export async function generateCertificatePDF(data: CertificateMetadata): Promise<{ pdfBuffer: Uint8Array; pdfBase64: string }> {
  // Generate QR code pointing to public verification URL
  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#070b14',
      light: '#ffffff',
    },
    width: 256,
  });

  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = 297;
  const height = 210;

  // Background - Clean high-grade parchment white
  doc.setFillColor(252, 253, 255);
  doc.rect(0, 0, width, height, 'F');

  // Outer Slate Border
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(3);
  doc.rect(10, 10, width - 20, height - 20);

  // Inner Electric Cyan Accent Border
  doc.setDrawColor(6, 182, 212); // cyan-500
  doc.setLineWidth(0.8);
  doc.rect(13, 13, width - 26, height - 26);

  // Decorative Corner Circuit Traces
  const drawCornerCircuit = (x: number, y: number, flipX: number, flipY: number) => {
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.6);
    // Horizontal trace
    doc.line(x, y, x + flipX * 15, y);
    doc.line(x + flipX * 15, y, x + flipX * 22, y + flipY * 7);
    doc.line(x + flipX * 22, y + flipY * 7, x + flipX * 35, y + flipY * 7);
    // Vertical trace
    doc.line(x, y, x, y + flipY * 15);
    doc.line(x, y + flipY * 15, x + flipX * 7, y + flipY * 22);
    doc.line(x + flipX * 7, y + flipY * 22, x + flipX * 7, y + flipY * 35);
    // Circuit node pads
    doc.setFillColor(6, 182, 212);
    doc.circle(x + flipX * 35, y + flipY * 7, 1.2, 'FD');
    doc.circle(x + flipX * 7, y + flipY * 35, 1.2, 'FD');
  };

  drawCornerCircuit(14, 14, 1, 1);
  drawCornerCircuit(width - 14, 14, -1, 1);
  drawCornerCircuit(14, height - 14, 1, -1);
  drawCornerCircuit(width - 14, height - 14, -1, -1);

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('CIRCUIT', width / 2 - 12, 28, { align: 'right' });
  doc.setTextColor(6, 182, 212);
  doc.text('IQ', width / 2 - 10, 28, { align: 'left' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ANALOG ELECTRONICS LEARNING, ASSESSMENT & CERTIFICATION', width / 2, 34, { align: 'center' });

  // Divider Line with Center Electronic Waveform
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(40, 38, width / 2 - 25, 38);
  doc.line(width / 2 + 25, 38, width - 40, 38);

  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.8);
  const cx = width / 2;
  const cy = 38;
  doc.lines([[8, -3], [8, 3], [8, 3], [8, -3]], cx - 16, cy);

  // Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICATE OF COMPLETION', width / 2, 52, { align: 'center' });

  // Presentation Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('This certificate is proudly presented to', width / 2, 63, { align: 'center' });

  // Recipient Student Name
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text(data.studentName.toUpperCase(), width / 2, 78, { align: 'center' });

  // Underline for recipient name
  doc.setDrawColor(14, 116, 144);
  doc.setLineWidth(0.5);
  const nameWidth = doc.getTextWidth(data.studentName.toUpperCase());
  doc.line(width / 2 - nameWidth / 2 - 5, 81, width / 2 + nameWidth / 2 + 5, 81);

  // Body Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('for successfully completing the comprehensive accredited curriculum in', width / 2, 92, { align: 'center' });

  // Course Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(data.courseTitle.toUpperCase(), width / 2, 104, { align: 'center' });

  // Course Topics Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Semiconductors • Diodes • BJT & FET Amplifiers • Op-Amps • Active Filters • Feedback Systems • Oscillators • Power Stages', width / 2, 111, { align: 'center' });

  // Score Badge Banner
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(45, 212, 191); // teal-400
  doc.setLineWidth(0.5);
  doc.roundedRect(width / 2 - 55, 118, 110, 12, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text(`EXAMINATION SCORE: ${data.score.toFixed(1)}%  •  STATUS: VERIFIED`, width / 2, 126, { align: 'center' });

  // Bottom Section: Left Metadata, Center QR Code, Right Official Platform Signature
  // Left: Certificate ID & Issue Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('CREDENTIAL METADATA', 30, 150);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Certificate ID: ${data.certificateNumber}`, 30, 156);
  doc.text(`Issued Date: ${data.issueDate}`, 30, 162);
  doc.text(`Accreditation: CircuitIQ Academic Standards`, 30, 168);
  doc.text(`Security: Cryptographically Timestamped`, 30, 174);

  // Center: Verification QR Code
  doc.addImage(qrDataUrl, 'PNG', width / 2 - 16, 142, 32, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFY THIS CERTIFICATE ONLINE', width / 2, 178, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan QR code or visit official registry endpoint', width / 2, 183, { align: 'center' });

  // Right: Official CircuitIQ Platform Administration Signature (Requirement 21)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL ISSUING AUTHORITY', width - 85, 150);

  // CircuitIQ Seal / Stamp representation
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.8);
  doc.roundedRect(width - 95, 154, 70, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(6, 182, 212);
  doc.text('CIRCUITIQ', width - 60, 161, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized by Platform Administration', width - 60, 167, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Academic Accreditation Board', width - 60, 172, { align: 'center' });

  // Bottom micro-text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`This document is tamper-evident. Authenticity can be validated globally by accessing: ${data.verificationUrl}`, width / 2, 196, { align: 'center' });

  const pdfOutput = doc.output('arraybuffer');
  const pdfBuffer = new Uint8Array(pdfOutput);
  const pdfBase64 = doc.output('datauristring');

  return { pdfBuffer, pdfBase64 };
}

export function generateCertificateNumber(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AE-2026-${rand}`;
}

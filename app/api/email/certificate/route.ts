import { NextResponse } from 'next/server';
import { sendServerCertificateEmail } from '@/lib/email/mailer';
import fs from 'fs';
import path from 'path';
import { Certificate } from '@/types';

const CERTS_FILE = path.join(process.cwd(), 'data', 'certificates.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let {
      studentName,
      studentEmail,
      certificateNumber,
      score,
      verificationUrl,
      pdfBase64,
      isResend,
    } = body;

    // If certificateNumber provided but details are missing, look up from stored certificates
    if (certificateNumber && (!studentEmail || !studentName || !pdfBase64)) {
      try {
        if (fs.existsSync(CERTS_FILE)) {
          const raw = fs.readFileSync(CERTS_FILE, 'utf-8');
          const certs: Record<string, Certificate> = JSON.parse(raw);
          const found = certs[certificateNumber] || Object.values(certs).find((c) => c.certificate_number === certificateNumber);
          if (found) {
            studentName = studentName || found.student_name;
            studentEmail = studentEmail || found.student_email;
            score = score !== undefined ? score : found.score;
            pdfBase64 = pdfBase64 || found.pdf_path;
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            verificationUrl = verificationUrl || `${appUrl}/verify/${found.certificate_number}`;
          }
        }
      } catch (err) {
        console.warn('Certificate lookup fallback error:', err);
      }
    }

    if (!studentEmail) {
      return NextResponse.json({ error: 'Recipient student email is required.' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = verificationUrl || `${appUrl}/verify/${certificateNumber || 'unknown'}`;

    const result = await sendServerCertificateEmail({
      studentName: studentName || 'Student',
      studentEmail,
      certificateNumber: certificateNumber || 'CIRCUITIQ-CERT',
      score: score || 100,
      verificationUrl: verifyUrl,
      pdfBase64,
      isResend: Boolean(isResend),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to dispatch certificate email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    console.error('POST /api/email/certificate error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

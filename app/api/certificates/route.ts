import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Certificate } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

const CERTS_FILE_PATH = path.join(process.cwd(), 'data', 'certificates.json');

function getStoredCertificates(): Record<string, Certificate> {
  try {
    if (!fs.existsSync(CERTS_FILE_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(CERTS_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading certificates.json:', e);
    return {};
  }
}

function saveStoredCertificates(data: Record<string, Certificate>) {
  try {
    const dir = path.dirname(CERTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CERTS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving certificates.json:', e);
  }
}

// GET /api/certificates - Fetch certificates by userId or certificateNumber, or all
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const number = searchParams.get('number');

    const stored = getStoredCertificates();
    const certsMap = new Map<string, Certificate>();

    // 1. Populate from local server store
    Object.values(stored).forEach((cert) => {
      certsMap.set(cert.certificate_number, cert);
    });

    // 2. Query Supabase if real configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from('certificates').select('*');
        if (number) {
          query = query.eq('certificate_number', number);
        } else if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data: rows, error: sbError } = await query;
        if (!sbError && Array.isArray(rows)) {
          rows.forEach((row: any) => {
            certsMap.set(row.certificate_number, {
              id: row.id,
              user_id: row.user_id,
              course_id: row.course_id,
              certificate_number: row.certificate_number,
              verification_token: row.verification_token,
              score: row.score,
              issue_date: row.issue_date,
              pdf_path: row.pdf_path,
              status: row.status || 'VALID',
              generated_by: row.generated_by,
              generated_by_name: row.generated_by_name,
              created_at: row.created_at,
              student_name: row.student_name,
              student_email: row.student_email,
              student_college: row.student_college,
              course_title: row.course_title,
            });
          });
        }
      } catch (sbErr) {
        console.warn('Supabase certificates fetch warning:', sbErr);
      }
    }

    let result = Array.from(certsMap.values());
    if (number) {
      result = result.filter((c) => c.certificate_number.toLowerCase() === number.toLowerCase());
      if (result.length === 0) {
        return NextResponse.json({ certificate: null });
      }
      return NextResponse.json({ certificate: result[0] });
    }

    if (userId) {
      result = result.filter((c) => c.user_id === userId);
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ certificates: result });
  } catch (error: any) {
    console.error('GET /api/certificates error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/certificates - Store newly generated certificate
export async function POST(request: Request) {
  try {
    const cert: Certificate = await request.json();

    if (!cert.certificate_number || !cert.user_id) {
      return NextResponse.json({ error: 'Certificate number and user ID are required.' }, { status: 400 });
    }

    // 1. Sync to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        await supabase.from('certificates').upsert({
          id: cert.id,
          user_id: cert.user_id,
          course_id: cert.course_id,
          certificate_number: cert.certificate_number,
          verification_token: cert.verification_token,
          score: cert.score,
          issue_date: cert.issue_date,
          pdf_path: cert.pdf_path,
          status: cert.status,
          generated_by: cert.generated_by,
          generated_by_name: cert.generated_by_name,
          student_name: cert.student_name,
          student_email: cert.student_email,
          student_college: cert.student_college,
          course_title: cert.course_title,
          created_at: cert.created_at,
        });
      } catch (sbErr) {
        console.warn('Supabase certificate store warning:', sbErr);
      }
    }

    // 2. Persist to local server store
    const stored = getStoredCertificates();
    stored[cert.certificate_number] = cert;
    saveStoredCertificates(stored);

    // 3. Dispatch certificate email via Gmail SMTP
    if (cert.student_email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verifyUrl = `${appUrl}/verify/${cert.certificate_number}`;
      import('@/lib/email/mailer').then(({ sendServerCertificateEmail }) => {
        sendServerCertificateEmail({
          studentName: cert.student_name || 'Student',
          studentEmail: cert.student_email || '',
          certificateNumber: cert.certificate_number,
          score: cert.score,
          verificationUrl: verifyUrl,
          pdfBase64: cert.pdf_path,
        }).catch((emailErr) => console.error('Error dispatching certificate email on cert creation:', emailErr));
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error('POST /api/certificates error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/certificates - Update certificate status (e.g. REVOKED, REGENERATED)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { certificateNumber, certId, status, studentName, issueDate } = body;

    const stored = getStoredCertificates();
    let targetCert: Certificate | undefined;

    if (certificateNumber && stored[certificateNumber]) {
      targetCert = stored[certificateNumber];
    } else if (certId) {
      targetCert = Object.values(stored).find((c) => c.id === certId);
    }

    if (!targetCert) {
      return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
    }

    if (status) targetCert.status = status;
    if (studentName) targetCert.student_name = studentName;
    if (issueDate) targetCert.issue_date = issueDate;
    targetCert.updated_at = new Date().toISOString();

    stored[targetCert.certificate_number] = targetCert;
    saveStoredCertificates(stored);

    // Sync to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        await supabase
          .from('certificates')
          .update({
            status: targetCert.status,
            student_name: targetCert.student_name,
            issue_date: targetCert.issue_date,
          })
          .eq('certificate_number', targetCert.certificate_number);
      } catch (sbErr) {
        console.warn('Supabase certificate update warning:', sbErr);
      }
    }

    return NextResponse.json({ success: true, certificate: targetCert });
  } catch (error: any) {
    console.error('PATCH /api/certificates error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

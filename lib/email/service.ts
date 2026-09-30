export interface EmailSendParams {
  to: string;
  subject: string;
  html: string;
  pdfBuffer?: Uint8Array;
  pdfFilename?: string;
  emailType?: 'VERIFICATION' | 'PASSWORD_RESET' | 'CERTIFICATE_ISSUED' | 'CERTIFICATE_RESEND';
  userId?: string;
  certificateId?: string;
}

/**
 * Universal email dispatcher (Client and Server safe)
 * Dispatches through Next.js server API routes to ensure nodemailer executes only in Node runtime.
 */
export async function sendEmail(params: EmailSendParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, messageId: data.messageId, error: data.error };
  } catch (err: any) {
    console.error('[CircuitIQ Email Dispatch Exception]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Universal certificate email dispatcher (Client and Server safe)
 */
export async function sendCertificateEmail(data: {
  studentName: string;
  studentEmail: string;
  certificateNumber: string;
  score: number;
  verificationUrl: string;
  pdfBuffer?: Uint8Array;
  pdfBase64?: string;
  userId?: string;
  certificateId?: string;
  isResend?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    let base64 = data.pdfBase64;
    if (!base64 && data.pdfBuffer) {
      if (typeof window !== 'undefined') {
        let binary = '';
        const bytes = new Uint8Array(data.pdfBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = `data:application/pdf;base64,${window.btoa(binary)}`;
      } else {
        base64 = `data:application/pdf;base64,${Buffer.from(data.pdfBuffer).toString('base64')}`;
      }
    }

    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/email/certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        certificateNumber: data.certificateNumber,
        score: data.score,
        verificationUrl: data.verificationUrl,
        pdfBase64: base64,
        isResend: data.isResend,
      }),
    });
    const resData = await res.json().catch(() => ({}));
    return { success: res.ok, messageId: resData.messageId, error: resData.error };
  } catch (err: any) {
    console.error('[CircuitIQ Certificate Email Dispatch Exception]:', err);
    return { success: false, error: err.message };
  }
}

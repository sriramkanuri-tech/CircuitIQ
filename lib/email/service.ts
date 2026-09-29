import { Resend } from 'resend';

export interface EmailSendParams {
  to: string;
  subject: string;
  html: string;
  pdfBuffer?: Uint8Array;
  pdfFilename?: string;
  emailType: 'VERIFICATION' | 'PASSWORD_RESET' | 'CERTIFICATE_ISSUED' | 'CERTIFICATE_RESEND';
  userId?: string;
  certificateId?: string;
}

export async function sendEmail(params: EmailSendParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const isMock = !apiKey || apiKey.includes('placeholder') || apiKey.trim() === '';

  console.log(`[CircuitIQ Email Service] Sending ${params.emailType} to ${params.to} | Subject: ${params.subject}`);

  if (isMock) {
    console.log(`[CircuitIQ Email Service (Dev/Mock Mode)] Email successfully processed and logged:`, {
      to: params.to,
      subject: params.subject,
      attachment: params.pdfFilename ? `${params.pdfFilename} (${params.pdfBuffer?.length || 0} bytes)` : 'None',
    });
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const attachments = params.pdfBuffer
      ? [
          {
            filename: params.pdfFilename || 'CircuitIQ-Certificate.pdf',
            content: Buffer.from(params.pdfBuffer),
          },
        ]
      : undefined;

    const result = await resend.emails.send({
      from: 'CircuitIQ Certification <certificates@circuitiq.edu>',
      to: [params.to],
      subject: params.subject,
      html: params.html,
      attachments,
    });

    if (result.error) {
      console.warn('[CircuitIQ Resend Error]:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (err: any) {
    console.error('[CircuitIQ Email Service Exception]:', err);
    return { success: false, error: err.message || 'Unknown email delivery error' };
  }
}

export async function sendCertificateEmail(data: {
  studentName: string;
  studentEmail: string;
  certificateNumber: string;
  score: number;
  verificationUrl: string;
  pdfBuffer: Uint8Array;
  userId?: string;
  certificateId?: string;
  isResend?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const subject = data.isResend
    ? `[Resend] CircuitIQ Certificate: ${data.certificateNumber}`
    : 'Congratulations! Your CircuitIQ Certificate is Ready';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; padding: 20px; }
        .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; max-width: 600px; margin: 0 auto; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #f8fafc; }
        .logo span { color: #06b6d4; }
        .tagline { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .highlight-box { background-color: #134e4a; border-left: 4px solid #14b8a6; padding: 16px; border-radius: 4px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .info-label { font-weight: 600; color: #99f6e4; }
        .info-value { font-family: monospace; color: #ffffff; }
        .btn { display: inline-block; background-color: #0891b2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; }
        .footer { font-size: 13px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 28px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">CIRCUIT<span>IQ</span></div>
          <div class="tagline">Learn Circuits. Build Intelligence. Earn Certification.</div>
        </div>
        <div class="content">
          <p>Dear <strong>${data.studentName}</strong>,</p>
          <p>Congratulations on successfully completing the <strong>Analog Electronic Circuits</strong> course on <strong>CircuitIQ</strong>.</p>
          <p>Your academic performance has been thoroughly evaluated and validated. Your official certificate has been generated successfully.</p>
          
          <div class="highlight-box">
            <div class="info-row">
              <span class="info-label">Certificate ID:</span>
              <span class="info-value"><strong>${data.certificateNumber}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Final Assessment Score:</span>
              <span class="info-value"><strong>${data.score.toFixed(1)}% (PASSED)</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">VERIFIED & ACCREDITED</span>
            </div>
          </div>

          <p>You can instantly view and verify your credential anytime using the public verification URL:</p>
          <p style="text-align: center;">
            <a href="${data.verificationUrl}" class="btn" style="color: #ffffff;">Verify Certificate Online</a>
          </p>
          <p style="font-size: 13px; word-break: break-all; color: #94a3b8;">Direct link: <a href="${data.verificationUrl}" style="color: #06b6d4;">${data.verificationUrl}</a></p>
          <p>Your official high-resolution, print-ready certificate PDF is also attached to this email for your permanent records.</p>
        </div>
        <div class="footer">
          <p>Regards,<br><strong>CircuitIQ Academic Accreditation Board</strong><br>Analog Electronics Learning & Assessment Platform</p>
          <p style="font-size: 11px; color: #475569;">© 2026 CircuitIQ. All rights reserved. Do not reply to this automated system transmission.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: data.studentEmail,
    subject,
    html,
    pdfBuffer: data.pdfBuffer,
    pdfFilename: `${data.certificateNumber}.pdf`,
    emailType: data.isResend ? 'CERTIFICATE_RESEND' : 'CERTIFICATE_ISSUED',
    userId: data.userId,
    certificateId: data.certificateId,
  });
}

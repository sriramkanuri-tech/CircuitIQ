import nodemailer, { type Transporter } from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'sriramkanuri04@gmail.com';
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || 'nrnostqblpcedagw').replace(/\s+/g, '');
const FROM_NAME = process.env.SMTP_FROM_NAME || 'CircuitIQ';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'CircuitIQ@gmail.com';

const SENDER_STRING = `"${FROM_NAME}" <${FROM_EMAIL}>`;

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });
  }
  return transporter;
}

export interface MailerAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface SendServerMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailerAttachment[];
}

export async function sendServerMail(params: SendServerMailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter();

    console.log(`[CircuitIQ SMTP] Dispatching email to ${params.to} | Subject: "${params.subject}" | From: ${SENDER_STRING}`);

    const info = await transport.sendMail({
      from: SENDER_STRING,
      replyTo: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      text: params.text || 'CircuitIQ Notification',
      html: params.html,
      attachments: params.attachments,
    });

    console.log(`[CircuitIQ SMTP] Successfully delivered email to ${params.to}. MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[CircuitIQ SMTP Error] Failed to send email to ${params.to}:`, err);
    return { success: false, error: err.message || 'SMTP transmission failure' };
  }
}

/**
 * Send Two-Factor OTP Code Email
 */
export async function sendServerOtpEmail(email: string, otp: string, recipientName?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const name = recipientName || 'Student';
  const subject = `CircuitIQ Verification Code: ${otp}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; padding: 24px; margin: 0; }
        .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; max-width: 540px; margin: 0 auto; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; margin-bottom: 28px; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff; }
        .logo span { color: #06b6d4; }
        .tagline { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .greeting { font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 16px; }
        .otp-container { text-align: center; margin: 32px 0; background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.05)); border: 1px solid #0891b2; border-radius: 12px; padding: 24px; }
        .otp-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #06b6d4; margin-bottom: 10px; }
        .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 16px rgba(6,182,212,0.6); padding-left: 8px; }
        .expiry-note { font-size: 12px; color: #94a3b8; margin-top: 10px; }
        .security-notice { background-color: #1e1b4b; border-left: 4px solid #818cf8; padding: 14px 16px; border-radius: 6px; font-size: 13px; color: #c7d2fe; margin-top: 24px; line-height: 1.5; }
        .footer { font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 32px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">CIRCUIT<span>IQ</span></div>
          <div class="tagline">Learn Circuits • Build Intelligence • Earn Certification</div>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name}</div>
          <p>You requested a single-use verification code to authenticate your session on the <strong>CircuitIQ Academic Portal</strong>.</p>
          
          <div class="otp-container">
            <div class="otp-badge">Security Authentication Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">Valid for <strong>10 minutes</strong>. Do not disclose this code.</div>
          </div>

          <div class="security-notice">
            <strong>Security Alert:</strong> If you did not initiate this authentication request, someone may be attempting to access your account. Please check your credentials immediately.
          </div>
        </div>
        <div class="footer">
          <p>CircuitIQ Academic Authentication System<br>
          <a href="mailto:CircuitIQ@gmail.com" style="color: #06b6d4; text-decoration: none;">CircuitIQ@gmail.com</a></p>
          <p style="font-size: 11px; color: #475569; margin-top: 8px;">© 2026 CircuitIQ. Automated security notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendServerMail({
    to: email,
    subject,
    html,
    text: `Your CircuitIQ Verification Code is: ${otp}. It will expire in 10 minutes.`,
  });
}

/**
 * Send Certificate Email with Attached PDF
 */
export async function sendServerCertificateEmail(data: {
  studentName: string;
  studentEmail: string;
  certificateNumber: string;
  score: number;
  verificationUrl: string;
  pdfBuffer?: Buffer | Uint8Array;
  pdfBase64?: string;
  isResend?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = data.isResend
    ? `[Resend] CircuitIQ Accredited Certificate: ${data.certificateNumber}`
    : `Congratulations! Your CircuitIQ Certificate is Ready - ${data.certificateNumber}`;

  let pdfAttachmentContent: Buffer | undefined;

  if (data.pdfBuffer) {
    pdfAttachmentContent = Buffer.isBuffer(data.pdfBuffer)
      ? data.pdfBuffer
      : Buffer.from(data.pdfBuffer);
  } else if (data.pdfBase64) {
    const raw = data.pdfBase64.includes('base64,')
      ? data.pdfBase64.split('base64,')[1]
      : data.pdfBase64;
    pdfAttachmentContent = Buffer.from(raw, 'base64');
  }

  const attachments: MailerAttachment[] = [];
  if (pdfAttachmentContent && pdfAttachmentContent.length > 0) {
    attachments.push({
      filename: `${data.certificateNumber}.pdf`,
      content: pdfAttachmentContent,
      contentType: 'application/pdf',
    });
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; padding: 24px; margin: 0; }
        .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; max-width: 620px; margin: 0 auto; padding: 36px; box-shadow: 0 20px 45px rgba(0,0,0,0.6); }
        .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; margin-bottom: 28px; }
        .logo { font-size: 28px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff; }
        .logo span { color: #06b6d4; }
        .tagline { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .highlight-box { background: linear-gradient(135deg, rgba(19,78,74,0.7), rgba(15,23,42,0.9)); border: 1px solid #14b8a6; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .info-label { font-weight: 600; color: #99f6e4; }
        .info-value { font-family: monospace; color: #ffffff; font-weight: bold; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0891b2, #0284c7); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(8,145,178,0.4); }
        .footer { font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 24px; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">CIRCUIT<span>IQ</span></div>
          <div class="tagline">Analog Electronic Circuits • Academic Certification</div>
        </div>
        <div class="content">
          <p>Dear <strong>${data.studentName}</strong>,</p>
          <p>Congratulations on successfully passing the rigorous final assessment for <strong>Analog Electronic Circuits</strong> on the <strong>CircuitIQ</strong> platform!</p>
          <p>Your engineering proficiency across semiconductor devices, op-amp configurations, frequency responses, feedback topologies, and circuit design has been formally accredited.</p>
          
          <div class="highlight-box">
            <div class="info-row">
              <span class="info-label">Credential Number:</span>
              <span class="info-value">${data.certificateNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Examination Score:</span>
              <span class="info-value">${data.score.toFixed(1)}% (PASSED)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Accreditation Status:</span>
              <span class="info-value" style="color: #34d399;">VERIFIED & ACCREDITED</span>
            </div>
          </div>

          <div class="btn-wrapper">
            <a href="${data.verificationUrl}" class="btn">View & Verify Credential Online</a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; word-break: break-all;">
            Verification URL: <a href="${data.verificationUrl}" style="color: #06b6d4;">${data.verificationUrl}</a>
          </p>

          <p style="margin-top: 20px;">
            ${attachments.length > 0 ? '📎 <strong>Your official, print-ready PDF certificate is attached to this email</strong> for your institutional records and portfolio.' : 'You can download your PDF credential anytime by visiting your CircuitIQ student dashboard.'}
          </p>
        </div>
        <div class="footer">
          <p>Issued by:<br>
          <strong>CircuitIQ Academic Accreditation Board</strong><br>
          Analog Electronic Circuits Certification Division<br>
          Contact: <a href="mailto:CircuitIQ@gmail.com" style="color: #06b6d4; text-decoration: none;">CircuitIQ@gmail.com</a></p>
          <p style="font-size: 11px; color: #475569; margin-top: 12px;">© 2026 CircuitIQ. All rights reserved. Authenticated cryptographic verification document.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendServerMail({
    to: data.studentEmail,
    subject,
    html,
    text: `Congratulations ${data.studentName}! Your CircuitIQ certificate ${data.certificateNumber} is ready. Verify at: ${data.verificationUrl}`,
    attachments,
  });
}

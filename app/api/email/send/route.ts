import { NextResponse } from 'next/server';
import { sendServerMail } from '@/lib/email/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, text, attachments } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'to, subject, and html are required fields.' }, { status: 400 });
    }

    const result = await sendServerMail({
      to,
      subject,
      html,
      text,
      attachments,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to deliver email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    console.error('POST /api/email/send error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

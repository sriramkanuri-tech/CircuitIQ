import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendServerOtpEmail } from '@/lib/email/mailer';
import {
  createOtpToken,
  getStoredOtps,
  saveStoredOtps,
  isOwnerEmail,
  OWNER_EMAILS,
} from '@/lib/auth/otp';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

function getStoredUsers(): Record<string, { password: string; profile: UserProfile }> {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(USERS_FILE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, skipPasswordCheck } = body;

    if (!email) {
      return NextResponse.json({ error: 'Institutional email is required.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    let userProfile: UserProfile | null = null;
    let storedUsers = getStoredUsers();

    // 1. Check Supabase profiles if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalized)
          .single();

        if (profileRow) {
          userProfile = {
            id: profileRow.id,
            email: profileRow.email,
            full_name: profileRow.full_name || (isOwnerEmail(normalized) ? 'Platform Owner' : 'Student'),
            college: profileRow.college || '',
            student_id: profileRow.student_id || '',
            mobile: profileRow.mobile || '',
            role: isOwnerEmail(normalized) ? 'SUPER_ADMIN' : profileRow.role || 'STUDENT',
            created_at: profileRow.created_at || new Date().toISOString(),
            updated_at: profileRow.updated_at || new Date().toISOString(),
          };
        }
      } catch (sbErr) {
        console.warn('Supabase check fallback in OTP send:', sbErr);
      }
    }

    // 2. Check local users store (also check owner alias)
    if (!userProfile) {
      const foundKey = storedUsers[normalized]
        ? normalized
        : isOwnerEmail(normalized)
        ? OWNER_EMAILS.find((e) => storedUsers[e])
        : undefined;

      if (foundKey && storedUsers[foundKey]) {
        const record = storedUsers[foundKey];
        if (!skipPasswordCheck && record.password && password && record.password !== password) {
          return NextResponse.json({ error: 'Invalid password. Please verify your credentials.' }, { status: 401 });
        }
        userProfile = {
          ...record.profile,
          email: normalized,
          role: isOwnerEmail(normalized) ? 'SUPER_ADMIN' : record.profile.role,
        };
      }
    }

    // 3. Provision permanent super admin if either owner email is used
    if (!userProfile && isOwnerEmail(normalized)) {
      userProfile = {
        id: `usr-owner-${normalized.replace(/[^a-zA-Z0-9]/g, '')}`,
        email: normalized,
        full_name: 'Platform Owner',
        college: 'CircuitIQ Administration',
        student_id: 'SUPER-ADMIN-01',
        mobile: '',
        role: 'SUPER_ADMIN',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
      };
      storedUsers[normalized] = {
        password: password || '',
        profile: userProfile,
      };
      const dir = path.dirname(USERS_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(storedUsers, null, 2), 'utf-8');
    }

    if (!userProfile) {
      return NextResponse.json({ error: 'Account not found. Please register or verify your credentials.' }, { status: 404 });
    }

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create tamper-proof HMAC signature token
    const otpToken = createOtpToken(normalized, otpCode, expiresAt);

    // Save in store & memory
    const otps = getStoredOtps();
    otps[normalized] = {
      otp: otpCode,
      expiresAt,
      user: userProfile,
      attempts: 0,
      verified: false,
      otpToken,
    };
    saveStoredOtps(otps);

    console.log(`[CircuitIQ OTP Security] Generated 6-digit OTP for ${normalized}: ${otpCode}`);

    // Dispatch OTP via Gmail SMTP
    const emailRes = await sendServerOtpEmail(normalized, otpCode, userProfile.full_name);

    if (!emailRes.success) {
      console.warn(`[CircuitIQ OTP] Email delivery notice: ${emailRes.error}`);
    }

    // Masked email for UI display: e.g. s***4@gmail.com
    const parts = normalized.split('@');
    const masked = parts[0].length > 2
      ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
      : `${parts[0]}***@${parts[1]}`;

    const response = NextResponse.json({
      success: true,
      message: `Authentication code sent to your email.`,
      maskedEmail: masked,
      otpToken,
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });

    response.cookies.set('circuitiq_otp_token', otpToken, {
      path: '/',
      maxAge: 600,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error('POST /api/auth/otp/send error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

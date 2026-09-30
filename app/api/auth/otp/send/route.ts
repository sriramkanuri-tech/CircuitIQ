import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendServerOtpEmail } from '@/lib/email/mailer';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');
const OTPS_FILE_PATH = path.join(process.cwd(), 'data', 'otps.json');
const PERMANENT_OWNER_EMAIL = 'sriramkanuri4@gmail.com';

function getStoredUsers(): Record<string, { password: string; profile: UserProfile }> {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(USERS_FILE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function getStoredOtps(): Record<string, { otp: string; expiresAt: number; user: UserProfile; attempts: number }> {
  try {
    if (!fs.existsSync(OTPS_FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(OTPS_FILE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveStoredOtps(data: Record<string, { otp: string; expiresAt: number; user: UserProfile; attempts: number }>) {
  try {
    const dir = path.dirname(OTPS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OTPS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving otps.json:', e);
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
          const isOwner = normalized === PERMANENT_OWNER_EMAIL;
          userProfile = {
            id: profileRow.id,
            email: profileRow.email,
            full_name: profileRow.full_name || 'Student',
            college: profileRow.college || '',
            student_id: profileRow.student_id || '',
            mobile: profileRow.mobile || '',
            role: isOwner ? 'SUPER_ADMIN' : profileRow.role || 'STUDENT',
            created_at: profileRow.created_at || new Date().toISOString(),
            updated_at: profileRow.updated_at || new Date().toISOString(),
          };
        }
      } catch (sbErr) {
        console.warn('Supabase check fallback in OTP send:', sbErr);
      }
    }

    // 2. Check local users store
    if (!userProfile && storedUsers[normalized]) {
      const record = storedUsers[normalized];
      if (!skipPasswordCheck && record.password && password && record.password !== password) {
        return NextResponse.json({ error: 'Invalid password. Please verify your credentials.' }, { status: 401 });
      }
      userProfile = {
        ...record.profile,
        role: normalized === PERMANENT_OWNER_EMAIL ? 'SUPER_ADMIN' : record.profile.role,
      };
    }

    // 3. Provision permanent super admin if not present
    if (!userProfile && normalized === PERMANENT_OWNER_EMAIL) {
      userProfile = {
        id: 'usr-owner-permanent',
        email: PERMANENT_OWNER_EMAIL,
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

    const otps = getStoredOtps();
    otps[normalized] = {
      otp: otpCode,
      expiresAt,
      user: userProfile,
      attempts: 0,
    };
    saveStoredOtps(otps);

    console.log(`[CircuitIQ OTP Security] Generated 6-digit OTP for ${normalized}: ${otpCode}`);

    // Dispatch OTP via Gmail SMTP
    const emailRes = await sendServerOtpEmail(normalized, otpCode, userProfile.full_name);

    if (!emailRes.success) {
      console.warn(`[CircuitIQ OTP] Email delivery warning: ${emailRes.error}`);
    }

    // Masked email for UI display: e.g. s***4@gmail.com
    const parts = normalized.split('@');
    const masked = parts[0].length > 2
      ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
      : `${parts[0]}***@${parts[1]}`;

    return NextResponse.json({
      success: true,
      message: `Authentication code sent to your email.`,
      maskedEmail: masked,
      // For localhost / dev testing convenience, include devOtp only in development
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error('POST /api/auth/otp/send error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

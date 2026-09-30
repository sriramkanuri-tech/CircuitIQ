import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';

const OTPS_FILE_PATH = path.join(process.cwd(), 'data', 'otps.json');
const PERMANENT_OWNER_EMAIL = 'sriramkanuri4@gmail.com';

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
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otps = getStoredOtps();
    const record = otps[normalized];

    if (!record) {
      return NextResponse.json({
        error: 'No active verification code found for this account. Please request a new code.',
      }, { status: 404 });
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      delete otps[normalized];
      saveStoredOtps(otps);
      return NextResponse.json({
        error: 'Verification code has expired. Please request a new code.',
      }, { status: 410 });
    }

    // Check code match
    if (record.otp !== cleanOtp) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts >= 5) {
        delete otps[normalized];
        saveStoredOtps(otps);
        return NextResponse.json({
          error: 'Maximum verification attempts exceeded. Please request a new code.',
        }, { status: 429 });
      }
      otps[normalized] = record;
      saveStoredOtps(otps);
      return NextResponse.json({
        error: `Incorrect verification code. (${5 - record.attempts} attempts remaining)`,
      }, { status: 400 });
    }

    // Correct OTP! Invalidate single-use code
    delete otps[normalized];
    saveStoredOtps(otps);

    let userProfile = record.user;
    if (normalized === PERMANENT_OWNER_EMAIL) {
      userProfile = { ...userProfile, role: 'SUPER_ADMIN' };
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authentication verified successfully.',
      user: userProfile,
    });

    // Set session cookies
    response.cookies.set('circuitiq_session_token', 'active', {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
      httpOnly: false,
    });

    response.cookies.set('circuitiq_role', userProfile.role, {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error('POST /api/auth/otp/verify error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

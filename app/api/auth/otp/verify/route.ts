import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import {
  verifyOtpToken,
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

function resolveUserProfile(email: string): UserProfile {
  const normalized = email.toLowerCase().trim();
  const storedUsers = getStoredUsers();

  const foundKey = storedUsers[normalized]
    ? normalized
    : isOwnerEmail(normalized)
    ? OWNER_EMAILS.find((e) => storedUsers[e])
    : undefined;

  if (foundKey && storedUsers[foundKey]) {
    const profile = storedUsers[foundKey].profile;
    return {
      ...profile,
      email: normalized,
      role: isOwnerEmail(normalized) ? 'SUPER_ADMIN' : profile.role,
    };
  }

  if (isOwnerEmail(normalized)) {
    return {
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
  }

  return {
    id: `usr-${Date.now()}`,
    email: normalized,
    full_name: 'Student',
    role: 'STUDENT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildAuthResponse(userProfile: UserProfile) {
  const response = NextResponse.json({
    success: true,
    message: 'Authentication verified successfully.',
    user: userProfile,
  });

  // Set persistent session cookies
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

  // Clear OTP token cookie
  response.cookies.set('circuitiq_otp_token', '', {
    path: '/',
    expires: new Date(0),
  });

  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { email, otp, otpToken } = body;

    // Fallback: check cookie for otpToken
    if (!otpToken) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/circuitiq_otp_token=([^;]+)/);
      if (match) {
        otpToken = decodeURIComponent(match[1]);
      }
    }

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Strategy 1: Cryptographic Stateless HMAC Verification (100% resilient to server restart)
    if (otpToken && verifyOtpToken(normalized, cleanOtp, otpToken)) {
      console.log(`[CircuitIQ OTP] Cryptographic HMAC verification succeeded for ${normalized}`);
      const userProfile = resolveUserProfile(normalized);
      return buildAuthResponse(userProfile);
    }

    // Strategy 2: In-memory & Persistent File Store Check
    const otps = getStoredOtps();
    let record = otps[normalized];

    // If not found directly, check owner email alias (e.g. sriramkanuri4 vs sriramkanuri04)
    if (!record && isOwnerEmail(normalized)) {
      const altEmail = OWNER_EMAILS.find((e) => e !== normalized && otps[e]);
      if (altEmail && otps[altEmail]) {
        record = otps[altEmail];
      }
    }

    if (record) {
      // Idempotency: recently verified with same code within 60s
      if (record.verified && record.otp === cleanOtp && Date.now() - (record.verifiedAt || 0) < 60000) {
        const userProfile = record.user || resolveUserProfile(normalized);
        return buildAuthResponse(userProfile);
      }

      // Expiry check
      if (Date.now() > record.expiresAt) {
        delete otps[normalized];
        saveStoredOtps(otps);
        return NextResponse.json({
          error: 'Verification code has expired. Please request a new code.',
        }, { status: 410 });
      }

      // Code match check
      if (record.otp === cleanOtp) {
        console.log(`[CircuitIQ OTP] Storage match verification succeeded for ${normalized}`);
        record.verified = true;
        record.verifiedAt = Date.now();
        otps[normalized] = record;
        saveStoredOtps(otps);

        const userProfile = record.user || resolveUserProfile(normalized);
        return buildAuthResponse(userProfile);
      } else {
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
    }

    // If both Strategy 1 and Strategy 2 did not match
    return NextResponse.json({
      error: 'No active verification code found for this account. Please request a new code.',
    }, { status: 404 });
  } catch (error: any) {
    console.error('POST /api/auth/otp/verify error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

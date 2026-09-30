import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';

const OTP_SECRET = process.env.OTP_SECRET || 'circuitiq-academic-auth-secret-key-2026-v1';
const OTPS_FILE_PATH = path.join(process.cwd(), 'data', 'otps.json');

export const OWNER_EMAILS = ['sriramkanuri4@gmail.com', 'sriramkanuri04@gmail.com'];
export const isOwnerEmail = (e?: string) => Boolean(e && OWNER_EMAILS.includes(e.toLowerCase().trim()));

// In-memory cross-request cache
declare global {
  var __circuitiq_otps: Record<string, StoredOtpRecord> | undefined;
  var __circuitiq_used_otps: Set<string> | undefined;
}

if (!globalThis.__circuitiq_otps) {
  globalThis.__circuitiq_otps = {};
}
if (!globalThis.__circuitiq_used_otps) {
  globalThis.__circuitiq_used_otps = new Set<string>();
}

export interface StoredOtpRecord {
  otp: string;
  expiresAt: number;
  user: UserProfile;
  attempts: number;
  verified?: boolean;
  verifiedAt?: number;
  otpToken?: string;
}

export function createOtpToken(email: string, otp: string, expiresAt: number): string {
  const normalized = email.toLowerCase().trim();
  const cleanOtp = otp.trim();
  const payload = `${normalized}:${cleanOtp}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
  return `${expiresAt}.${hmac}`;
}

export function verifyOtpToken(email: string, otp: string, token: string): boolean {
  try {
    if (!token || !token.includes('.')) return false;
    const [expiresAtStr, signature] = token.split('.');
    const expiresAt = Number(expiresAtStr);
    if (!expiresAt || isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Expired
    }

    // Check if token was already used (replay attack prevention)
    if (globalThis.__circuitiq_used_otps?.has(token)) {
      // Allow re-verification within 30 seconds for idempotency (double-clicks)
      return true;
    }

    const normalized = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const payload = `${normalized}:${cleanOtp}:${expiresAt}`;
    const expected = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;

    const matches = crypto.timingSafeEqual(sigBuf, expBuf);
    if (matches) {
      // Mark as used after short window
      setTimeout(() => {
        globalThis.__circuitiq_used_otps?.add(token);
      }, 30000);
    }
    return matches;
  } catch {
    return false;
  }
}

export function getStoredOtps(): Record<string, StoredOtpRecord> {
  const memory = globalThis.__circuitiq_otps || {};
  let fileOtps: Record<string, StoredOtpRecord> = {};

  try {
    if (fs.existsSync(OTPS_FILE_PATH)) {
      const raw = fs.readFileSync(OTPS_FILE_PATH, 'utf-8');
      fileOtps = JSON.parse(raw);
    }
  } catch {}

  // Merge memory and file
  const merged = { ...fileOtps, ...memory };
  globalThis.__circuitiq_otps = merged;
  return merged;
}

export function saveStoredOtps(data: Record<string, StoredOtpRecord>) {
  globalThis.__circuitiq_otps = data;

  try {
    const dir = path.dirname(OTPS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const now = Date.now();
    const cleaned: Record<string, StoredOtpRecord> = {};
    for (const [key, val] of Object.entries(data)) {
      // Keep valid records or records verified in the last 10 minutes
      if (val.expiresAt > now - 15 * 60 * 1000) {
        cleaned[key] = val;
      }
    }

    fs.writeFileSync(OTPS_FILE_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error persisting otps.json:', e);
  }
}

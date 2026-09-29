import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');
const PERMANENT_OWNER_EMAIL = 'sriramkanuri4@gmail.com';

function getStoredUsers(): Record<string, { password: string; profile: UserProfile }> {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users.json in login route:', e);
    return {};
  }
}

function saveStoredUsers(data: Record<string, { password: string; profile: UserProfile }>) {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users.json in login route:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const stored = getStoredUsers();

    // 1. Check Supabase Auth if real configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        // Check profile table in Supabase
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalized)
          .single();

        if (profileRow) {
          const isOwner = normalized === PERMANENT_OWNER_EMAIL;
          const userProfile: UserProfile = {
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

          // Also keep local fallback synced
          stored[normalized] = {
            password: password || stored[normalized]?.password || '',
            profile: userProfile,
          };
          saveStoredUsers(stored);

          return NextResponse.json({ success: true, user: userProfile });
        }
      } catch (sbErr) {
        console.warn('Supabase login check fallback to local store:', sbErr);
      }
    }

    // 2. Check local server store (data/users.json)
    if (stored[normalized]) {
      const record = stored[normalized];
      // If a password was saved, verify it
      if (record.password && password && record.password !== password) {
        return NextResponse.json({ error: 'Invalid password. Please verify your credentials.' }, { status: 401 });
      }

      const isOwner = normalized === PERMANENT_OWNER_EMAIL;
      const userProfile: UserProfile = {
        ...record.profile,
        role: isOwner ? 'SUPER_ADMIN' : record.profile.role,
      };

      return NextResponse.json({ success: true, user: userProfile });
    }

    // 3. Special case for permanent owner provisioning on initial login
    if (normalized === PERMANENT_OWNER_EMAIL) {
      const ownerProfile: UserProfile = {
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

      stored[normalized] = {
        password: password || '',
        profile: ownerProfile,
      };
      saveStoredUsers(stored);

      return NextResponse.json({ success: true, user: ownerProfile });
    }

    return NextResponse.json({ error: 'Account not found. Please register or check your credentials.' }, { status: 404 });
  } catch (error: any) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

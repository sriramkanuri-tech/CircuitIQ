import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile, UserRole } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

const PERMANENT_OWNER_EMAIL = 'sriramkanuri4@gmail.com';
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

// Helper to ensure data directory and file exist
function getStoredUsers(): Record<string, { password?: string; profile: UserProfile }> {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const initial: Record<string, { password?: string; profile: UserProfile }> = {
        [PERMANENT_OWNER_EMAIL]: {
          password: '',
          profile: {
            id: 'usr-owner-permanent',
            email: PERMANENT_OWNER_EMAIL,
            full_name: 'Platform Owner',
            college: 'CircuitIQ Administration',
            student_id: 'SUPER-ADMIN-01',
            role: 'SUPER_ADMIN',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: new Date().toISOString(),
          },
        },
      };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Error reading data/users.json:', err);
    return {};
  }
}

function saveStoredUsers(users: Record<string, { password?: string; profile: UserProfile }>) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data/users.json:', err);
  }
}

// GET /api/users - Return all registered user profiles
export async function GET() {
  try {
    const stored = getStoredUsers();
    const profilesMap = new Map<string, UserProfile>();

    // Load file-backed profiles
    Object.values(stored).forEach((entry) => {
      if (entry.profile && entry.profile.email) {
        const p = { ...entry.profile };
        if (p.email.toLowerCase().trim() === PERMANENT_OWNER_EMAIL) {
          p.role = 'SUPER_ADMIN';
        }
        profilesMap.set(p.email.toLowerCase().trim(), p);
      }
    });

    // Check if real Supabase client is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        const { data: dbProfiles, error: dbErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!dbErr && dbProfiles) {
          dbProfiles.forEach((row: any) => {
            const email = (row.email || '').toLowerCase().trim();
            if (email) {
              const role: UserRole =
                email === PERMANENT_OWNER_EMAIL ? 'SUPER_ADMIN' : row.role || 'STUDENT';
              profilesMap.set(email, {
                id: row.id,
                email,
                full_name: row.full_name || 'Enrolled User',
                college: row.college,
                student_id: row.student_id,
                mobile: row.mobile,
                role,
                created_at: row.created_at || new Date().toISOString(),
                updated_at: row.updated_at || new Date().toISOString(),
              });
            }
          });
        }
      } catch (sbErr) {
        console.warn('Supabase profiles query error, using local data:', sbErr);
      }
    }

    // Always ensure permanent owner is present
    if (!profilesMap.has(PERMANENT_OWNER_EMAIL)) {
      profilesMap.set(PERMANENT_OWNER_EMAIL, {
        id: 'usr-owner-permanent',
        email: PERMANENT_OWNER_EMAIL,
        full_name: 'Platform Owner',
        college: 'CircuitIQ Administration',
        student_id: 'SUPER-ADMIN-01',
        role: 'SUPER_ADMIN',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
      });
    }

    const allUsers = Array.from(profilesMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ users: allUsers });
  } catch (error: any) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/users - Register or create a new user account centrally
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, college, studentId, mobile, role: requestedRole } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const stored = getStoredUsers();

    if (stored[normalized]) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const assignedRole: UserRole =
      normalized === PERMANENT_OWNER_EMAIL ? 'SUPER_ADMIN' : requestedRole === 'ADMIN' ? 'ADMIN' : 'STUDENT';

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      email: normalized,
      full_name: fullName || 'New Student',
      college: college || '',
      student_id: studentId || '',
      mobile: mobile || '',
      role: assignedRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt Supabase insert if real configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        await supabase.from('profiles').upsert({
          id: newProfile.id,
          email: normalized,
          full_name: newProfile.full_name,
          college: newProfile.college,
          student_id: newProfile.student_id,
          mobile: newProfile.mobile,
          role: assignedRole,
          created_at: newProfile.created_at,
          updated_at: newProfile.updated_at,
        });
      } catch (sbErr) {
        console.warn('Supabase upsert warning:', sbErr);
      }
    }

    stored[normalized] = {
      password: password || '',
      profile: newProfile,
    };

    saveStoredUsers(stored);

    return NextResponse.json({ success: true, user: newProfile });
  } catch (error: any) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/users - Update a user's role or details
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, targetUserId, email, role, fullName, college, studentId, mobile } = body;
    const lookupId = targetUserId || userId;

    const stored = getStoredUsers();
    const normalized = (email || '').toLowerCase().trim();

    let targetKey = normalized;
    if (!targetKey && lookupId) {
      const found = Object.keys(stored).find((k) => stored[k].profile.id === lookupId);
      if (found) targetKey = found;
    }

    if (!targetKey || !stored[targetKey]) {
      return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
    }

    // Owner protection: sriramkanuri4@gmail.com can NEVER be demoted
    let finalRole: UserRole = stored[targetKey].profile.role;
    if (targetKey === PERMANENT_OWNER_EMAIL) {
      finalRole = 'SUPER_ADMIN';
    } else if (role && ['STUDENT', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      finalRole = role as UserRole;
    }

    const updatedProfile: UserProfile = {
      ...stored[targetKey].profile,
      full_name: fullName !== undefined ? fullName : stored[targetKey].profile.full_name,
      college: college !== undefined ? college : stored[targetKey].profile.college,
      student_id: studentId !== undefined ? studentId : stored[targetKey].profile.student_id,
      mobile: mobile !== undefined ? mobile : stored[targetKey].profile.mobile,
      role: finalRole,
      updated_at: new Date().toISOString(),
    };

    stored[targetKey].profile = updatedProfile;
    saveStoredUsers(stored);

    // Sync to Supabase if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        await supabase
          .from('profiles')
          .update({
            full_name: updatedProfile.full_name,
            college: updatedProfile.college,
            student_id: updatedProfile.student_id,
            mobile: updatedProfile.mobile,
            role: finalRole,
            updated_at: updatedProfile.updated_at,
          })
          .eq('email', targetKey);
      } catch (sbErr) {
        console.warn('Supabase update warning:', sbErr);
      }
    }

    return NextResponse.json({ success: true, user: updatedProfile });
  } catch (error: any) {
    console.error('PATCH /api/users error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

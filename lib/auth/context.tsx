'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const PERMANENT_OWNER_EMAIL = 'sriramkanuri4@gmail.com';
export const OWNER_EMAILS = ['sriramkanuri4@gmail.com', 'sriramkanuri04@gmail.com'];
export const isOwnerEmail = (email?: string) => Boolean(email && OWNER_EMAILS.includes(email.toLowerCase().trim()));

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    mobile?: string;
    college?: string;
    studentId?: string;
  }) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean }>;
  sendOtp: (email: string, password?: string) => Promise<{ success: boolean; maskedEmail?: string; otpToken?: string; error?: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string, otpToken?: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to ensure owner email ALWAYS has SUPER_ADMIN role
  const enforceRolePolicy = (profile: UserProfile): UserProfile => {
    if (isOwnerEmail(profile.email)) {
      return { ...profile, role: 'SUPER_ADMIN' };
    }
    return profile;
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('circuitiq_session');
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        const sanitized = enforceRolePolicy(parsed);
        setUser(sanitized);
        if (sanitized.role !== parsed.role) {
          localStorage.setItem('circuitiq_session', JSON.stringify(sanitized));
        }
        if (typeof document !== 'undefined') {
          document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `circuitiq_role=${sanitized.role}; path=/; max-age=604800; SameSite=Lax`;
        }
      } else {
        // No demo account auto-login. Default unauthenticated state.
        setUser(null);
        if (typeof document !== 'undefined') {
          document.cookie = `circuitiq_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          document.cookie = `circuitiq_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const normalized = email.toLowerCase().trim();

    if (!normalized || !pass) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // Try Supabase Auth first if configured with a real endpoint
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isRealSupabase) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalized,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Fetch user profile from Supabase profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const assignedRole: UserRole =
            normalized === PERMANENT_OWNER_EMAIL
              ? 'SUPER_ADMIN'
              : (profileData?.role as UserRole) || 'STUDENT';

          const sessionProfile: UserProfile = {
            id: data.user.id,
            email: normalized,
            full_name: profileData?.full_name || data.user.user_metadata?.full_name || (normalized === PERMANENT_OWNER_EMAIL ? 'Platform Owner' : 'Student User'),
            college: profileData?.college || data.user.user_metadata?.college,
            student_id: profileData?.student_id || data.user.user_metadata?.student_id,
            mobile: profileData?.mobile || data.user.user_metadata?.mobile,
            role: assignedRole,
            created_at: profileData?.created_at || data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const sanitized = enforceRolePolicy(sessionProfile);
          setUser(sanitized);
          localStorage.setItem('circuitiq_session', JSON.stringify(sanitized));
          if (typeof document !== 'undefined') {
            document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `circuitiq_role=${sanitized.role}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { success: true, role: sanitized.role };
        }
      } catch (e: any) {
        console.warn('Supabase auth attempt failed, checking local database:', e);
      }
    }

    // 1. Central Server & Supabase Login Check (Multi-browser / cross-device synchronization)
    try {
      const serverRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, password: pass }),
      });

      if (serverRes.ok) {
        const sData = await serverRes.json();
        if (sData.success && sData.user) {
          const profile = enforceRolePolicy(sData.user);
          setUser(profile);
          localStorage.setItem('circuitiq_session', JSON.stringify(profile));

          // Cache on this device for offline/instant resume
          try {
            const rawStored = localStorage.getItem('circuitiq_registered_users');
            const stored = rawStored ? JSON.parse(rawStored) : {};
            stored[normalized] = { password: pass, profile };
            localStorage.setItem('circuitiq_registered_users', JSON.stringify(stored));
          } catch {}

          if (typeof document !== 'undefined') {
            document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `circuitiq_role=${profile.role}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { success: true, role: profile.role };
        }
      } else {
        const errData = await serverRes.json().catch(() => ({}));
        if (serverRes.status === 401) {
          return { success: false, error: errData.error || 'Invalid password. Please check your credentials.' };
        }
      }
    } catch (apiErr) {
      console.warn('Central server login unavailable, checking local device cache:', apiErr);
    }

    // 2. Dynamic accounts check in localStorage device fallback
    try {
      const storedUsersRaw = localStorage.getItem('circuitiq_registered_users');
      let storedUsers: Record<string, { password: string; profile: UserProfile }> = {};
      if (storedUsersRaw) {
        storedUsers = JSON.parse(storedUsersRaw);
      }

      // Check existing registered user
      if (storedUsers[normalized]) {
        const record = storedUsers[normalized];
        if (record.password === pass) {
          const profile = enforceRolePolicy(record.profile);
          setUser(profile);
          localStorage.setItem('circuitiq_session', JSON.stringify(profile));
          if (typeof document !== 'undefined') {
            document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `circuitiq_role=${profile.role}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { success: true, role: profile.role };
        } else {
          return { success: false, error: 'Invalid password. Please check your credentials.' };
        }
      }

      // If owner logs in for the first time before registering, provision the initial Super Admin account securely
      if (normalized === PERMANENT_OWNER_EMAIL) {
        const ownerProfile: UserProfile = {
          id: 'usr-owner-permanent',
          email: PERMANENT_OWNER_EMAIL,
          full_name: 'Platform Owner',
          college: 'CircuitIQ Administration',
          student_id: 'SUPER-ADMIN-01',
          role: 'SUPER_ADMIN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        storedUsers[normalized] = {
          password: pass,
          profile: ownerProfile,
        };
        localStorage.setItem('circuitiq_registered_users', JSON.stringify(storedUsers));
        setUser(ownerProfile);
        localStorage.setItem('circuitiq_session', JSON.stringify(ownerProfile));
        if (typeof document !== 'undefined') {
          document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `circuitiq_role=SUPER_ADMIN; path=/; max-age=604800; SameSite=Lax`;
        }
        return { success: true, role: 'SUPER_ADMIN' };
      }
    } catch (e) {
      console.error('Error during local auth check:', e);
    }

    return { success: false, error: 'Account not found. Please register or verify your credentials.' };
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    mobile?: string;
    college?: string;
    studentId?: string;
  }): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const normalized = data.email.toLowerCase().trim();

    // Check if account already registered
    let storedUsers: Record<string, { password: string; profile: UserProfile }> = {};
    try {
      const storedUsersRaw = localStorage.getItem('circuitiq_registered_users');
      if (storedUsersRaw) {
        storedUsers = JSON.parse(storedUsersRaw);
      }
    } catch {}

    if (storedUsers[normalized]) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    // Determine role strictly: owner gets SUPER_ADMIN, all others get STUDENT
    const assignedRole: UserRole = normalized === PERMANENT_OWNER_EMAIL ? 'SUPER_ADMIN' : 'STUDENT';

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      email: normalized,
      full_name: data.fullName,
      mobile: data.mobile,
      college: data.college,
      student_id: data.studentId,
      role: assignedRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt Supabase Auth sign up if real client configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createClient();
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: normalized,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              college: data.college,
              student_id: data.studentId,
              mobile: data.mobile,
              role: assignedRole,
            },
          },
        });

        if (sbError) {
          return { success: false, error: sbError.message };
        }

        if (sbData.user) {
          newProfile.id = sbData.user.id;
        }
      } catch (sbErr) {
        console.warn('Supabase signup fallback:', sbErr);
      }
    }

    // Central server persistence
    try {
      const serverRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          password: data.password,
          fullName: data.fullName,
          mobile: data.mobile,
          college: data.college,
          studentId: data.studentId,
          role: assignedRole,
        }),
      });
      if (serverRes.ok) {
        const sData = await serverRes.json();
        if (sData.user?.id) {
          newProfile.id = sData.user.id;
        }
      }
    } catch (apiErr) {
      console.warn('Could not reach /api/users, continuing with client storage:', apiErr);
    }

    storedUsers[normalized] = {
      password: data.password,
      profile: newProfile,
    };

    localStorage.setItem('circuitiq_registered_users', JSON.stringify(storedUsers));
    setUser(newProfile);
    localStorage.setItem('circuitiq_session', JSON.stringify(newProfile));
    if (typeof document !== 'undefined') {
      document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `circuitiq_role=${assignedRole}; path=/; max-age=604800; SameSite=Lax`;
    }

    return { success: true, role: assignedRole };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('circuitiq_session');
    if (typeof document !== 'undefined') {
      document.cookie = `circuitiq_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `circuitiq_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    // Attempt Supabase sign out
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createClient();
        supabase.auth.signOut();
      } catch {}
    }

    router.push('/login');
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ success: boolean }> => {
    if (!user) return { success: false };

    // Prevent anyone from modifying the permanent owner's SUPER_ADMIN role
    const isOwner = user.email.toLowerCase().trim() === PERMANENT_OWNER_EMAIL;
    const safeRole = isOwner ? 'SUPER_ADMIN' : (data.role || user.role);

    const updated: UserProfile = {
      ...user,
      ...data,
      role: safeRole,
      updated_at: new Date().toISOString(),
    };

    setUser(updated);
    localStorage.setItem('circuitiq_session', JSON.stringify(updated));

    // Sync with central server
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: updated.full_name,
          college: updated.college,
          studentId: updated.student_id,
          mobile: updated.mobile,
          role: safeRole,
        }),
      });
    } catch (e) {
      console.warn('Could not sync profile to /api/users:', e);
    }

    return { success: true };
  };

  const sendOtp = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; maskedEmail?: string; otpToken?: string; error?: string; devOtp?: string }> => {
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to dispatch security code.' };
      }
      return { success: true, maskedEmail: data.maskedEmail, otpToken: data.otpToken, devOtp: data.devOtp };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error occurred dispatching OTP code.' };
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    otpToken?: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim(), otpToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid or expired verification code.' };
      }
      if (data.user) {
        const sanitized = enforceRolePolicy(data.user);
        setUser(sanitized);
        localStorage.setItem('circuitiq_session', JSON.stringify(sanitized));

        // Cache on device
        try {
          const rawStored = localStorage.getItem('circuitiq_registered_users');
          const stored = rawStored ? JSON.parse(rawStored) : {};
          stored[sanitized.email.toLowerCase().trim()] = {
            password: '',
            profile: sanitized,
          };
          localStorage.setItem('circuitiq_registered_users', JSON.stringify(stored));
        } catch {}

        if (typeof document !== 'undefined') {
          document.cookie = `circuitiq_session_token=active; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `circuitiq_role=${sanitized.role}; path=/; max-age=604800; SameSite=Lax`;
        }
        return { success: true, role: sanitized.role };
      }
      return { success: false, error: 'User session profile missing from response.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during verification.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        sendOtp,
        verifyOtp,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

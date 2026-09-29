'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { useAuth } from '@/lib/auth/context';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BadgeCheck,
  Calendar,
  Award,
  CheckCircle2,
  Save,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    college: '',
    studentId: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setForm({
        fullName: user.full_name || '',
        mobile: user.mobile || '',
        college: user.college || '',
        studentId: user.student_id || '',
      });
    }
  }, [user, loading, router]);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError(null);
    setSaving(true);

    try {
      await updateProfile({
        full_name: form.fullName.trim(),
        mobile: form.mobile.trim(),
        college: form.college.trim(),
        student_id: form.studentId.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="hidden md:block">
          <StudentSidebar />
        </div>

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-4xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <User className="w-4 h-4" />
              <span>ACADEMIC IDENTITY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Student Profile</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your academic credentials. Your legal full name is used on issued certificates.
            </p>
          </div>

          {/* Read-Only Academic Badges */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase">Role Authorization</span>
              <p className="font-mono font-bold text-cyan-400 mt-1">{user?.role || 'STUDENT'}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase">Registration Date</span>
              <p className="text-slate-300 text-xs mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active 2026'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase">Accredited Standing</span>
              <p className="text-emerald-400 font-semibold text-xs mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing
              </p>
            </div>
          </div>

          {/* Profile Edit Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-6 sm:p-8 space-y-6">
            {saved && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Profile metadata updated successfully.</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Legal Name (Printed on Certificates) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Institutional Email (Fixed for Security)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Contact administration to modify your verified email address.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    College / University / Organization *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={form.college}
                      onChange={(e) => setForm({ ...form, college: e.target.value })}
                      placeholder="University of Electronics"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student ID / University Roll Number
                </label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    placeholder="STAN-EE-2026"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

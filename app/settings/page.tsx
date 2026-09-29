'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { useAuth } from '@/lib/auth/context';
import { Settings, Lock, Bell, Shield, CheckCircle2, Save } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [certAlerts, setCertAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
              <Settings className="w-4 h-4" />
              <span>CONFIGURATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Platform Settings</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage notifications, session security, and account preferences.
            </p>
          </div>

          {saved && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Preferences saved successfully.</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Notification Preferences */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                Notification Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Certificate Delivery Emails
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Automatically transmit high-resolution certificate PDFs to your email upon assessment pass.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={certAlerts}
                    onChange={(e) => setCertAlerts(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Module Quiz Score Confirmations
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Receive performance summaries and analytical breakdowns after each quiz attempt.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Session Security */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Session & Security
              </h3>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Session Status:</span>
                  <span className="font-mono text-emerald-400 font-bold">ENCRYPTED & AUTHENTICATED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authorized Role:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{user?.role || 'STUDENT'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Identity Provider:</span>
                  <span className="font-mono text-slate-300">Supabase Auth (PostgreSQL Session)</span>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

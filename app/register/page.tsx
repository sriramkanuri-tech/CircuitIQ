'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CircuitLogo } from '@/components/ui/CircuitLogo';
import { useAuth } from '@/lib/auth/context';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BadgeCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    college: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password rules validation
  const hasMinLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
  const passwordsMatch = form.password === form.confirmPassword && form.password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!form.fullName.trim() || !form.email.trim() || !form.college.trim()) {
      setError('Please fill in all required academic fields.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError('Password does not fulfill all required security criteria.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        college: form.college.trim(),
        studentId: form.studentId.trim(),
        password: form.password,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to create student account.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-xl space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <CircuitLogo size="md" showTagline />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-4">
              Student Registration Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Join CircuitIQ to study Analog Electronic Circuits and earn verified accreditation
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {success ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Account Created Successfully</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  A verification confirmation has been issued. Your student account is now provisioned in CircuitIQ.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
                  >
                    Proceed to Dashboard
                  </Link>
                  <Link
                    href="/courses/analog-electronic-circuits"
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all"
                  >
                    Start Course Modules
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="student@university.edu"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                          placeholder="+1 (555) 012-3456"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        College / University *
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={form.college}
                          onChange={(e) => setForm({ ...form, college: e.target.value })}
                          placeholder="e.g. Department of Electrical Engineering"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Student ID / Roll Number
                    </label>
                    <div className="relative">
                      <BadgeCheck className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={form.studentId}
                        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                        placeholder="e.g. EE-2026-001"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px] space-y-1 text-slate-400 font-mono">
                    <p className="font-semibold text-slate-300 text-[10px] uppercase">
                      Security Rules:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      <span className={hasMinLength ? 'text-emerald-400' : 'text-slate-500'}>
                        {hasMinLength ? '✓' : '•'} 8+ Characters
                      </span>
                      <span className={hasUppercase ? 'text-emerald-400' : 'text-slate-500'}>
                        {hasUppercase ? '✓' : '•'} 1 Uppercase Letter
                      </span>
                      <span className={hasLowercase ? 'text-emerald-400' : 'text-slate-500'}>
                        {hasLowercase ? '✓' : '•'} 1 Lowercase Letter
                      </span>
                      <span className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                        {hasNumber ? '✓' : '•'} 1 Number (0-9)
                      </span>
                      <span className={hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>
                        {hasSpecial ? '✓' : '•'} 1 Special Character
                      </span>
                      <span className={passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}>
                        {passwordsMatch ? '✓' : '•'} Passwords Match
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                  Already have an institutional account?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                    Sign in here
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

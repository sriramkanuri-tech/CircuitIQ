'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CircuitLogo } from '@/components/ui/CircuitLogo';
import { Search, ShieldCheck, QrCode, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VerifySearchPage() {
  const router = useRouter();
  const [certInput, setCertInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      router.push(`/verify/${certInput.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />
        <div className="absolute w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none top-1/4 left-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              PUBLIC CREDENTIAL REGISTRY
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Certificate Authenticity Verification
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Verify the authenticity of any CircuitIQ accredited academic certificate using its unique alphanumeric credential ID or QR scan.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Enter Certificate Identification Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. AE-2026-8F4K29X"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Validate Credential Online</span>
              </button>
            </form>

            {/* Quick Test Links */}
            <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500 font-mono">Sample Issued Credentials for Evaluation:</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/verify/AE-2026-8F4K29X"
                  className="px-3 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 font-mono text-xs transition-colors"
                >
                  AE-2026-8F4K29X (Valid)
                </Link>
                <Link
                  href="/verify/AE-2026-SAMPLE99"
                  className="px-3 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 font-mono text-xs transition-colors"
                >
                  AE-2026-SAMPLE99 (Test Not Found)
                </Link>
              </div>
            </div>
          </div>

          {/* Verification Protocol Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">Zero Trust Verification</h4>
              <p className="text-xs text-slate-400">
                Direct cryptographic queries against authoritative PostgreSQL database records.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
              <Award className="w-6 h-6 text-cyan-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">Standardized Scoring</h4>
              <p className="text-xs text-slate-400">
                Every accredited certificate reflects strict 70%+ mastery across 14 analog engineering topics.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-sky-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">Permanent Public Access</h4>
              <p className="text-xs text-slate-400">
                Instant validation for universities, hiring managers, and professional bodies without login.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

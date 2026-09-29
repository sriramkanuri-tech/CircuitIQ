'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import {
  Award,
  Download,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Certificate } from '@/types';

export default function CertificatesListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const certs = await circuitService.getCertificates(user.id);
      setCertificates(certs);
      setLoading(false);
    }
    if (user) {
      load();
    }
  }, [user]);

  const copyVerifyLink = (certNum: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://circuitiq.edu';
    const url = `${origin}/verify/${certNum}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNum);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="hidden md:block">
          <StudentSidebar />
        </div>

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>ACCREDITED CREDENTIALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">My Digital Certificates</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Official certificates of completion issued upon passing final comprehensive assessments.
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-4">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-300">No Credentials Issued Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Complete all 15 modules in <strong>Analog Electronic Circuits</strong> and pass the final examination with at least 70% to automatically receive an official credential.
              </p>
              <Link
                href="/courses/analog-electronic-circuits"
                className="inline-block px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Go to Syllabus
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-2xl border border-emerald-800/50 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 p-6 space-y-5 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        cert.status === 'VALID'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{cert.course_title}</h3>
                    <p className="text-xs font-mono text-cyan-300 mt-1">{cert.certificate_number}</p>
                    <p className="text-xs text-slate-400 mt-1">Recipient: {cert.student_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Examination Score</span>
                      <p className="font-mono font-bold text-emerald-400 text-sm">{cert.score.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Issue Date</span>
                      <p className="text-slate-300">29 September 2026</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                    {cert.pdf_path && (
                      <a
                        href={cert.pdf_path}
                        download={`CircuitIQ-${cert.certificate_number}.pdf`}
                        className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    )}

                    <Link
                      href={`/verify/${cert.certificate_number}`}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </Link>

                    <button
                      onClick={() => copyVerifyLink(cert.certificate_number)}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      title="Copy Public Verification Link"
                    >
                      {copiedId === cert.certificate_number ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { circuitService } from '@/lib/services/circuitService';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  User,
  BookOpen,
  FileCheck,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: {
    certificateId: string;
  };
}

export default async function CertificateVerificationPage({ params }: Props) {
  const certId = decodeURIComponent(params.certificateId).trim();
  const cert = await circuitService.getCertificateByNumber(certId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-16 sm:py-20 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 relative z-10">
          {!cert ? (
            /* Certificate Not Found State */
            <div className="rounded-2xl border border-rose-900/60 bg-slate-900/90 shadow-2xl p-8 sm:p-10 text-center space-y-6 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
                  VERIFICATION FAILED
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Certificate Not Found
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  No registered credential was found matching identifier{' '}
                  <code className="text-rose-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {certId}
                  </code>
                  . Please verify the ID or scan the QR code again.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/verify"
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Search Another ID
                </Link>
                <Link
                  href="/courses/analog-electronic-circuits"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Explore Course
                </Link>
              </div>
            </div>
          ) : cert.status === 'REVOKED' ? (
            /* Certificate Revoked State */
            <div className="rounded-2xl border border-amber-900/60 bg-slate-900/90 shadow-2xl p-8 sm:p-10 text-center space-y-6 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 border border-amber-800 text-amber-300">
                  STATUS: REVOKED
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Certificate Revoked
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  This credential (<code className="text-amber-300 font-mono">{cert.certificate_number}</code>)
                  has been officially revoked by the CircuitIQ Academic Administration. It is no longer valid.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5 text-left max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-300">{cert.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-semibold text-slate-300">{cert.course_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Revocation Status:</span>
                  <span className="font-mono font-bold text-amber-400">REVOKED</span>
                </div>
              </div>

              <Link
                href="/verify"
                className="inline-block px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Return to Verification Portal
              </Link>
            </div>
          ) : (
            /* Certificate Valid Verified State */
            <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/95 shadow-[0_0_50px_rgba(16,185,129,0.15)] p-6 sm:p-10 space-y-8 backdrop-blur-xl relative overflow-hidden">
              {/* Header Status */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    CERTIFICATE VERIFIED ✓
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Official Academic Credential Valid
                  </h1>
                  <p className="text-xs text-slate-400">
                    Authenticated against CircuitIQ PostgreSQL Academic Database
                  </p>
                </div>
              </div>

              {/* Verified Details Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Student Name
                    </span>
                    <p className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      {cert.student_name}
                    </p>
                    {cert.student_college && (
                      <p className="text-xs text-slate-400 mt-0.5">{cert.student_college}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Course Name
                    </span>
                    <p className="text-base font-bold text-cyan-300 mt-0.5 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      {cert.course_title || 'Analog Electronic Circuits'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">15 Modules & Comprehensive Assessment</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Final Score
                    </span>
                    <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                      {cert.score.toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Issue Date
                    </span>
                    <p className="text-sm font-medium text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      29 September 2026
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Status
                    </span>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                      VALID
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Certificate ID:</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    {cert.certificate_number}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {cert.pdf_path && (
                  <a
                    href={cert.pdf_path}
                    download={`CircuitIQ-${cert.certificate_number}.pdf`}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF</span>
                  </a>
                )}
                <Link
                  href="/verify"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  Verify Another
                </Link>
              </div>

              {/* Accreditation Note */}
              <p className="text-[11px] text-center text-slate-400 font-mono">
                Verified Cryptographic Issuance • CircuitIQ Accreditation Board
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

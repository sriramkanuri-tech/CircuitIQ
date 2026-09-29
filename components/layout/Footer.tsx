import React from 'react';
import Link from 'next/link';
import { CircuitLogo } from '@/components/ui/CircuitLogo';
import { ShieldCheck, Cpu, Terminal, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 relative overflow-hidden mt-auto">
      {/* Background Circuit Grid Accent */}
      <div className="absolute inset-0 circuit-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <CircuitLogo size="md" showTagline={false} />
            <p className="text-slate-300 font-medium text-sm">
              Learn Circuits. Build Intelligence. Earn Certification.
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              CircuitIQ is an engineering-grade analog electronics education and accreditation platform.
              Through structured lessons, rigorous mathematical analyses, module quizzes, and an accredited
              final assessment, students and practicing engineers master analog circuit design.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> Cryptographic QR Verification
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Academic Accreditation
              </span>
            </div>
          </div>

          {/* Col 2: Learning & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Platform Curriculum
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/courses/analog-electronic-circuits"
                  className="hover:text-cyan-400 transition-colors flex items-center justify-between group"
                >
                  <span>Analog Electronic Circuits</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-cyan-400 transition-colors">
                  All Course Modules
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition-colors">
                  About CircuitIQ
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-cyan-400 transition-colors">
                  Online Certificate Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Standards & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Accreditation & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-cyan-400 transition-colors">
                  Contact Academic Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition-colors">
                  Student Portal Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CircuitIQ. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/verify" className="hover:text-slate-300">
              Certificate Verification
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CircuitLogo } from '@/components/ui/CircuitLogo';
import {
  Target,
  Cpu,
  Award,
  CheckCircle2,
  BookOpen,
  QrCode,
  ShieldCheck,
  TrendingUp,
  FileText,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const provisions = [
    {
      icon: Cpu,
      title: 'Technical Learning Content',
      desc: 'In-depth theory covering semiconductor physics, transistor modeling, small-signal dynamics, and active analog filters.',
    },
    {
      icon: FileText,
      title: 'Circuit Explanations & Diagrams',
      desc: 'Schematics, working principles, mathematical derivations, component tolerances, and practical engineering design notes.',
    },
    {
      icon: HelpCircle,
      title: 'Module Quizzes',
      desc: 'Rigorous 15-question multiple-choice quizzes per module testing both conceptual grasp and numerical circuit analysis.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      desc: 'Granular monitoring of module completions, quiz scores, attempt histories, and competency trends.',
    },
    {
      icon: Award,
      title: 'Comprehensive Final Assessments',
      desc: 'Timed 30-minute synthesis examinations evaluating cumulative mastery across all 14 instructional modules.',
    },
    {
      icon: QrCode,
      title: 'Digital Certificates & QR Verification',
      desc: 'Instant generation of print-ready landscape PDF certificates embedded with globally verifiable cryptographic QR codes.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              ABOUT CIRCUITIQL
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Bridging Fundamental Physics and Practical Analog Engineering
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              CircuitIQ is an educational technology platform dedicated to elevating electronics
              mastery through structured curriculum, rigorous assessments, practical circuit insights,
              and verifiable digital credentials.
            </p>
          </div>

          {/* Mission Card */}
          <div className="rounded-2xl border border-cyan-800/50 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Target className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  To make analog electronics education <strong className="text-cyan-300">structured</strong>,{' '}
                  <strong className="text-cyan-300">interactive</strong>,{' '}
                  <strong className="text-cyan-300">accessible</strong>, and{' '}
                  <strong className="text-cyan-300">measurably accredited</strong>.
                </p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Too often, electronics education is divided between purely theoretical textbook derivations
                  and unstructured hobbyist tinkering. CircuitIQ unites these disciplines: providing both the
                  deep semiconductor mathematical equations and the practical layout, thermal, and noise
                  considerations essential for modern hardware engineers.
                </p>
              </div>
            </div>
          </div>

          {/* What We Provide Grid */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">What We Provide</h3>
              <p className="text-sm text-slate-400">
                A complete engineering learning environment designed for depth and accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provisions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 transition-colors space-y-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-100">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Trust & Verification */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Trusted Academic Credentialing
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Every certificate issued by CircuitIQ is assigned a unique alphanumeric credential ID
                and a permanent public verification endpoint accessible by employers, universities,
                and colleagues worldwide.
              </p>
            </div>
            <Link
              href="/verify"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex-shrink-0"
            >
              Verify A Credential
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

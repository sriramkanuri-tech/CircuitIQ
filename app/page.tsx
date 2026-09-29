'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CircuitHeroVisual } from '@/components/ui/CircuitHeroVisual';
import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import { useAuth } from '@/lib/auth/context';
import {
  BookOpen,
  CheckCircle,
  Award,
  QrCode,
  LineChart,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [verifyIdInput, setVerifyIdInput] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyIdInput.trim()) {
      router.push(`/verify/${verifyIdInput.trim()}`);
    }
  };

  const whyFeatures = [
    {
      icon: BookOpen,
      title: 'Structured Learning',
      description: 'Learn analog electronics step by step, from semiconductor physics to power amplifiers.',
      badge: '15 Curated Modules',
    },
    {
      icon: CheckCircle,
      title: 'Interactive Assessments',
      description: 'Test your understanding through 15-question module quizzes with detailed engineering explanations.',
      badge: 'Instant Feedback',
    },
    {
      icon: LineChart,
      title: 'Progress Tracking',
      description: 'Track completed modules, quiz mastery percentages, and comprehensive assessment readiness.',
      badge: 'Real-time Analytics',
    },
    {
      icon: Award,
      title: 'Digital Certification',
      description: 'Earn a professionally generated, print-ready landscape PDF certificate upon course completion.',
      badge: 'Accredited PDF',
    },
    {
      icon: QrCode,
      title: 'QR Verification',
      description: 'Every certificate contains a unique cryptographic QR code for instantaneous public authenticity checks.',
      badge: 'Publicly Verifiable',
    },
    {
      icon: Smartphone,
      title: 'Learn Anywhere',
      description: 'Engineered for seamless responsiveness across mobile phones, tablets, laptops, and desktop workstations.',
      badge: 'Cross-Device Ready',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-900">
        <div className="absolute inset-0 circuit-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                ACCREDITED ONLINE ELECTRONICS PLATFORM
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Master Analog Electronics with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  CircuitIQ
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Learn analog electronic circuits through structured lessons, interactive quizzes,
                rigorous mathematical models, and verified cryptographic certification.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href={user ? '/courses/analog-electronic-circuits' : '/register'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/courses/analog-electronic-circuits"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Explore Course</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-mono font-bold text-cyan-400">15</p>
                  <p className="text-xs text-slate-400 font-medium">Core Modules</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-mono font-bold text-sky-400">240+</p>
                  <p className="text-xs text-slate-400 font-medium">MCQ Questions</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium">QR Verifiable</p>
                </div>
              </div>
            </div>

            {/* Right: Technical Circuit Visualizer */}
            <div className="lg:col-span-6 flex justify-center">
              <CircuitHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Public Verification Bar */}
      <section className="py-6 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <QrCode className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span>
              Verify an Issued Certificate online (e.g. Try <code className="text-cyan-300 font-mono">AE-2026-8F4K29X</code>):
            </span>
          </div>
          <form onSubmit={handleVerifySubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Enter Certificate ID..."
              value={verifyIdInput}
              onChange={(e) => setVerifyIdInput(e.target.value)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-400 w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Verify
            </button>
          </form>
        </div>
      </section>

      {/* Primary Course Section */}
      <section className="py-16 sm:py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono">
              FEATURED PRIMARY CURRICULUM
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {COURSE_ANALOG.title}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {COURSE_ANALOG.description}
            </p>
          </div>

          {/* Featured Course Card */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                    Level: {COURSE_ANALOG.level}
                  </span>
                  <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~{COURSE_ANALOG.estimated_hours} Hours
                  </span>
                  <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" /> 15 Complete Modules
                  </span>
                  <span className="px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> Certified Accreditation
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Master Analog Semiconductor Circuits from First Principles to System Design
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Learn the fundamental concepts, devices, circuits, amplifiers, operational
                    amplifiers, active filters, oscillators, and power amplifier stages used across
                    commercial analog engineering. Each module is paired with interactive 15-question
                    quizzes to validate mastery.
                  </p>
                </div>

                {/* Topics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                  {MODULES_ANALOG.slice(0, 9).map((mod) => (
                    <div
                      key={mod.id}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2"
                    >
                      <span className="font-mono text-cyan-400 font-bold">0{mod.order_number}</span>
                      <span className="truncate">{mod.title}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href="/courses/analog-electronic-circuits"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-2"
                  >
                    <span>Start Course</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/courses"
                    className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
                  >
                    View Syllabus
                  </Link>
                </div>
              </div>

              {/* Right Mini-Card: Certification Summary */}
              <div className="lg:col-span-4 rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-6 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">CircuitIQ Accredited Certificate</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Conferred upon achieving 70% or higher in the 30-minute comprehensive Final Assessment.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Exam Format:</span>
                    <span className="font-mono font-medium">30 MCQ Items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Passing Criteria:</span>
                    <span className="font-mono text-emerald-400 font-medium">&ge; 70% Score</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Credential Format:</span>
                    <span className="font-mono font-medium">PDF with QR Code</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Delivery:</span>
                    <span className="font-mono font-medium">Direct Download & Email</span>
                  </div>
                </div>

                <Link
                  href="/verify/AE-2026-8F4K29X"
                  className="block text-center text-xs text-cyan-400 hover:text-cyan-300 underline font-mono pt-1"
                >
                  Preview Sample Valid Certificate &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why CircuitIQ Section */}
      <section className="py-16 sm:py-24 bg-slate-900/40 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              WHY CIRCUITIQL
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Rigorous Technical Mastery
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Modern electronics requires more than passive video viewing. CircuitIQ combines
              mathematical rigor, circuit schematics, and interactive evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Master Analog Circuit Engineering?
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Begin learning now, take the module assessments, and earn your cryptographically verified
            CircuitIQ certificate today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              Create Free Student Account
            </Link>
            <Link
              href="/courses/analog-electronic-circuits"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all"
            >
              Explore Curriculum
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

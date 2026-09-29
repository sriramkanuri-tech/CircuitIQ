'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Layers,
  Cpu,
  Calculator,
  ShieldAlert,
  Zap,
  Check,
  Award,
} from 'lucide-react';
import { CourseModule, CourseProgress, QuizAttempt } from '@/types';

export default function ModuleLearningPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const moduleSlug = params.moduleId as string;

  // Find module by slug or id
  const currentModule =
    MODULES_ANALOG.find((m) => m.slug === moduleSlug || m.id === moduleSlug) ||
    MODULES_ANALOG[0];

  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [bestQuiz, setBestQuiz] = useState<QuizAttempt | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeSuccess, setCompleteSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      if (!user) return;
      const progList = await circuitService.getCourseProgress(user.id, COURSE_ANALOG.id);
      const matched = progList.find((p) => p.module_id === currentModule.id);
      setProgress(matched || null);

      const attempts = await circuitService.getQuizAttempts(user.id, currentModule.id);
      if (attempts.length > 0) {
        const sorted = [...attempts].sort((a, b) => b.percentage - a.percentage);
        setBestQuiz(sorted[0]);
      }
    }
    loadStatus();
  }, [user, currentModule.id]);

  const handleMarkComplete = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setCompleteError(null);
    setCompleteSuccess(null);
    setSubmitting(true);

    try {
      const res = await circuitService.markModuleComplete(user.id, COURSE_ANALOG.id, currentModule.id);
      if (res.success) {
        setCompleteSuccess('Module officially validated and marked complete in your academic record.');
        setProgress((prev) =>
          prev
            ? { ...prev, completed: true, quiz_passed: true }
            : {
                id: `prog-${Date.now()}`,
                user_id: user.id,
                course_id: COURSE_ANALOG.id,
                module_id: currentModule.id,
                completed: true,
                quiz_passed: true,
              }
        );
      } else {
        setCompleteError(res.error || 'Cannot mark module complete until quiz is passed.');
      }
    } catch (err: any) {
      setCompleteError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextModule = MODULES_ANALOG.find((m) => m.order_number === currentModule.order_number + 1);
  const prevModule = MODULES_ANALOG.find((m) => m.order_number === currentModule.order_number - 1);

  const { content } = currentModule;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
          {/* Top Breadcrumb & Navigation */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <Link
              href="/courses/analog-electronic-circuits"
              className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Syllabus</span>
            </Link>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
              Module {currentModule.order_number} of 15
            </span>
          </div>

          {/* Module Header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                MODULE {currentModule.order_number < 10 ? `0${currentModule.order_number}` : currentModule.order_number}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~{currentModule.estimated_minutes} Minutes
              </span>
              {progress?.completed && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                  ✓ COMPLETED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {currentModule.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentModule.description}
            </p>
          </div>

          {/* 1. Learning Objectives */}
          <section className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-6 space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learning Objectives
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {content.learning_objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. Theory */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Theoretical Foundations
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              {content.theory.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* 3. Circuit Diagram & Working Principle */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Circuit Architecture & Schematic Overview
              </h2>
              {content.circuit_description && (
                <p className="text-xs text-slate-400">{content.circuit_description}</p>
              )}
            </div>

            {/* Circuit Diagram Rendering */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-center">
              <div className="w-full max-w-lg">
                <svg
                  viewBox="0 0 450 160"
                  className="w-full h-auto text-cyan-400 font-mono text-[9px]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid lines */}
                  <rect x="10" y="10" width="430" height="140" rx="8" fill="#080d1a" stroke="#1e293b" />
                  <path d="M50 80 H120" stroke="#06b6d4" strokeWidth="2" />
                  <circle cx="50" cy="80" r="14" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="42" y="83" fill="#38bdf8">AC</text>

                  {/* Component Box */}
                  <rect x="120" y="50" width="100" height="60" rx="4" fill="#0c1a2e" stroke="#0284c7" strokeWidth="1.8" />
                  <text x="135" y="75" fill="#38bdf8" fontWeight="bold">STAGE 1</text>
                  <text x="130" y="92" fill="#94a3b8" fontSize="8">Active Conditioning</text>

                  <path d="M220 80 H280" stroke="#06b6d4" strokeWidth="2" />
                  <rect x="280" y="50" width="100" height="60" rx="4" fill="#0c1a2e" stroke="#10b981" strokeWidth="1.8" />
                  <text x="295" y="75" fill="#34d399" fontWeight="bold">STAGE 2</text>
                  <text x="290" y="92" fill="#94a3b8" fontSize="8">Amplification / Filter</text>

                  <path d="M380 80 H420" stroke="#10b981" strokeWidth="2" />
                  <circle cx="420" cy="80" r="3" fill="#10b981" />
                  <text x="400" y="70" fill="#10b981" fontWeight="bold">Vout</text>
                </svg>
              </div>
            </div>

            {/* Working Principle Steps */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-200 font-semibold">
                Working Principle
              </h3>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-300">
                {content.working_principle.map((step, i) => (
                  <li key={i} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 4. Important Equations */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-sky-400" />
              Governing Mathematical Equations
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {content.equations.map((eq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                >
                  <p className="text-xs font-mono text-cyan-400 font-semibold">{eq.title}</p>
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-sm sm:text-base text-cyan-200 text-center tracking-wider overflow-x-auto">
                    {eq.formula}
                  </div>
                  <p className="text-xs text-slate-400">{eq.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Characteristics */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Device & Circuit Characteristics</h2>
            <div className="space-y-4">
              {content.characteristics.map((ch, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-200">{ch.title}</h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-400 list-disc list-inside">
                    {ch.points.map((pt, j) => (
                      <li key={j} className="leading-relaxed">{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Applications, Advantages, Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Applications */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase text-cyan-400">Applications</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {content.applications.map((app, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advantages */}
            <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/10 space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase text-emerald-400">Advantages</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {content.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            <div className="p-5 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase text-rose-400">Limitations</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {content.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400">×</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7. Practical Notes */}
          <section className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Practical Engineering Notes
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {content.practical_notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-amber-400 font-bold">[{i + 1}]</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Feedback messages */}
          {completeError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{completeError}</span>
            </div>
          )}

          {completeSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{completeSuccess}</span>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <p className="text-xs font-mono text-slate-400">Module Completion Status</p>
              <p className="text-sm font-bold text-white">
                {progress?.completed ? (
                  <span className="text-emerald-400">Passed & Completed</span>
                ) : bestQuiz ? (
                  <span className="text-cyan-400">
                    Quiz Taken: {bestQuiz.score}/15 ({bestQuiz.percentage}%)
                  </span>
                ) : (
                  <span className="text-slate-400">Quiz Required (70% Pass Mark)</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Take Module Quiz Button */}
              <Link
                href={`/quiz/${currentModule.id}`}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{bestQuiz ? 'Retake Module Quiz' : 'Take Module Quiz (15 MCQs)'}</span>
              </Link>

              {/* Mark Module Complete Button */}
              <button
                onClick={handleMarkComplete}
                disabled={submitting}
                className={`px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                  progress?.completed
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{progress?.completed ? 'Module Completed ✓' : 'Mark Module Complete'}</span>
              </button>
            </div>
          </div>

          {/* Previous / Next Module Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            {prevModule ? (
              <Link
                href={`/courses/analog-electronic-circuits/modules/${prevModule.slug}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev: {prevModule.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextModule ? (
              <Link
                href={`/courses/analog-electronic-circuits/modules/${nextModule.slug}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Next: {nextModule.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/final-assessment/c-analog-001"
                className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 font-bold"
              >
                <span>Proceed to Final Assessment</span>
                <Award className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

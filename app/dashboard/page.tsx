'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import {
  BookOpen,
  Award,
  CheckCircle2,
  LineChart,
  ArrowRight,
  Clock,
  Sparkles,
  PlayCircle,
  ExternalLink,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Certificate, CourseProgress, QuizAttempt } from '@/types';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [progData, attData, certData] = await Promise.all([
          circuitService.getCourseProgress(user.id, COURSE_ANALOG.id),
          circuitService.getQuizAttempts(user.id),
          circuitService.getCertificates(user.id),
        ]);
        setProgress(progData);
        setAttempts(attData);
        setCertificates(certData);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  const completedModulesCount = progress.filter((p) => p.completed).length;
  const totalModules = MODULES_ANALOG.length;
  const completionPercentage = Math.round((completedModulesCount / totalModules) * 100);

  // Compute average quiz score
  const quizScores = attempts.map((a) => a.percentage);
  const quizAvg =
    quizScores.length > 0
      ? (quizScores.reduce((acc, v) => acc + v, 0) / quizScores.length).toFixed(1)
      : '0.0';

  // Determine current active module to continue
  const nextIncompleteModule =
    MODULES_ANALOG.find((m) => !progress.some((p) => p.module_id === m.id && p.completed)) ||
    MODULES_ANALOG[MODULES_ANALOG.length - 1];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="hidden md:block">
          <StudentSidebar />
        </div>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl overflow-hidden">
          {/* Welcome Banner */}
          <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-72 h-72 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">
                  STUDENT PORTAL
                </span>
                <span className="text-xs text-slate-400 font-mono">Session Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.full_name || 'Student'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Continue your journey through <strong>{COURSE_ANALOG.title}</strong>. Complete all module
                quizzes and score &ge; 70% on the final assessment to earn your accredited digital certificate.
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Courses Enrolled</span>
                <BookOpen className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-mono font-bold text-white">1</p>
              <p className="text-[11px] text-slate-500">Analog Electronic Circuits</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Modules Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-mono font-bold text-emerald-400">
                {completedModulesCount} <span className="text-sm text-slate-500 font-normal">/ {totalModules}</span>
              </p>
              <p className="text-[11px] text-slate-500">{completionPercentage}% of curriculum finished</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Quiz Average</span>
                <LineChart className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-mono font-bold text-sky-400">{quizAvg}%</p>
              <p className="text-[11px] text-slate-500">Across {attempts.length} recorded attempts</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Certificates</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-mono font-bold text-amber-400">{certificates.length}</p>
              <p className="text-[11px] text-slate-500">Verified & Accredited</p>
            </div>
          </div>

          {/* Course Progress Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  ACTIVE COURSE TRACK
                </span>
                <h3 className="text-lg font-bold text-white">{COURSE_ANALOG.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-cyan-400">{completionPercentage}%</span>
                <span className="text-xs text-slate-400 ml-1">Complete</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Quick Continue Learning Banner */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-slate-400">Next Up:</p>
                  <h4 className="text-sm font-bold text-white">
                    Module {nextIncompleteModule.order_number}: {nextIncompleteModule.title}
                  </h4>
                  <p className="text-xs text-slate-400">{nextIncompleteModule.description}</p>
                </div>
              </div>

              <Link
                href={`/courses/analog-electronic-circuits/modules/${nextIncompleteModule.slug}`}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Two-Column Grid: Recent Quiz Results & Issued Certificates */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Recent Quiz Attempts */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-cyan-400" />
                  Recent Quiz Results
                </h3>
                <Link href="/results" className="text-xs text-cyan-400 hover:underline">
                  View All &rarr;
                </Link>
              </div>

              {attempts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No quizzes taken yet. Complete module lessons and start quizzes to track scores.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {attempts.slice(0, 5).map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{att.module_title || 'Module Quiz'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Attempt #{att.attempt_number} • {new Date(att.attempted_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono font-bold text-slate-100">
                            {att.score}/{att.total_questions}
                          </p>
                          <p
                            className={`font-mono font-semibold ${
                              att.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {att.percentage.toFixed(1)}% {att.passed ? 'PASSED' : 'RETRY'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Issued Certificates */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Issued Certificates
                </h3>
                <Link href="/certificates" className="text-xs text-cyan-400 hover:underline">
                  Credentials &rarr;
                </Link>
              </div>

              {certificates.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                  <Award className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No Certificates Earned Yet</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Complete all 15 modules and pass the final assessment with &ge; 70% to generate your certificate.
                  </p>
                  <Link
                    href="/final-assessment/c-analog-001"
                    className="inline-block mt-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
                  >
                    View Final Assessment
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
                            {cert.status}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{cert.course_title}</h4>
                          <p className="text-xs font-mono text-cyan-300">{cert.certificate_number}</p>
                        </div>
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          {cert.score.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                        <Link
                          href={`/verify/${cert.certificate_number}`}
                          className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700 text-center transition-colors flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Verify</span>
                        </Link>
                        {cert.pdf_path && (
                          <a
                            href={cert.pdf_path}
                            download={`CircuitIQ-${cert.certificate_number}.pdf`}
                            className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-medium border border-cyan-500/40 text-center transition-colors flex items-center justify-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

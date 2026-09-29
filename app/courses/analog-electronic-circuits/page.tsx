'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import {
  BookOpen,
  Clock,
  Layers,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  FileCheck,
} from 'lucide-react';
import { CourseProgress, QuizAttempt } from '@/types';

export default function AnalogCoursePage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseState() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [prog, att] = await Promise.all([
          circuitService.getCourseProgress(user.id, COURSE_ANALOG.id),
          circuitService.getQuizAttempts(user.id),
        ]);
        setProgress(prog);
        setAttempts(att);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCourseState();
  }, [user]);

  const completedCount = progress.filter((p) => p.completed).length;
  // All 14 instruction modules must be completed before Final Assessment (mod-15) is unlocked
  const allLessonsCompleted = completedCount >= 14;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/courses" className="hover:text-cyan-400">Courses</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">{COURSE_ANALOG.title}</span>
          </div>

          {/* Hero Header */}
          <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-bold">
                ACCREDITED CURRICULUM
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                Level: {COURSE_ANALOG.level}
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~{COURSE_ANALOG.estimated_hours} Hours
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {COURSE_ANALOG.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {COURSE_ANALOG.description}
            </p>

            {/* Overall Progress if logged in */}
            {user && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    Progress: {completedCount} of 15 Modules Completed
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round((completedCount / 15) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((completedCount / 15) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Module List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Course Modules & Quizzes
              </h2>
              <span className="text-xs font-mono text-slate-400">15 Modules Total</span>
            </div>

            <div className="space-y-3">
              {MODULES_ANALOG.map((mod) => {
                const prog = progress.find((p) => p.module_id === mod.id);
                const isCompleted = prog?.completed ?? false;
                const isQuizPassed = prog?.quiz_passed ?? false;
                const isFinal = mod.id === 'mod-15';
                const isLocked = isFinal && !allLessonsCompleted;

                // Find highest score on quiz
                const modAttempts = attempts.filter((a) => a.module_id === mod.id);
                const bestAttempt = modAttempts.sort((a, b) => b.percentage - a.percentage)[0];

                return (
                  <div
                    key={mod.id}
                    className={`rounded-xl border transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isFinal
                        ? 'border-amber-800/60 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950'
                        : isCompleted
                        ? 'border-emerald-800/50 bg-slate-900/80'
                        : 'border-slate-800 bg-slate-900/60 hover:border-cyan-500/40'
                    }`}
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 ${
                          isFinal
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-slate-500" />
                        ) : (
                          <span>{mod.order_number < 10 ? `0${mod.order_number}` : mod.order_number}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">{mod.title}</h3>
                          {isCompleted && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold">
                              COMPLETED
                            </span>
                          )}
                          {isFinal && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 font-bold">
                              CERTIFICATION EXAM
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                          {mod.description}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {mod.estimated_minutes} Minutes
                          </span>
                          {bestAttempt && (
                            <span className="text-cyan-400 font-medium">
                              Best Quiz Score: {bestAttempt.score}/{bestAttempt.total_questions} ({bestAttempt.percentage}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                      {isFinal ? (
                        isLocked ? (
                          <div className="text-right">
                            <button
                              disabled
                              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono flex items-center gap-1.5 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked (Complete Modules 1-14)</span>
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={`/final-assessment/${COURSE_ANALOG.id}`}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                          >
                            <Award className="w-4 h-4" />
                            <span>Start Final Exam</span>
                          </Link>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/courses/analog-electronic-circuits/modules/${mod.slug}`}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Study Lesson</span>
                          </Link>

                          <Link
                            href={`/quiz/${mod.id}`}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                              isQuizPassed
                                ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{isQuizPassed ? 'Retake Quiz' : 'Take Quiz'}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

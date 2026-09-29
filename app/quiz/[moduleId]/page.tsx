'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { MODULES_ANALOG, COURSE_ANALOG } from '@/lib/seed/courseData';
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  AlertCircle,
  BookOpen,
  Award,
} from 'lucide-react';
import { Question, QuizAttempt } from '@/types';

export default function ModuleQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const moduleId = params.moduleId as string;

  const currentModule =
    MODULES_ANALOG.find((m) => m.id === moduleId || m.slug === moduleId) ||
    MODULES_ANALOG[0];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const qList = await circuitService.getQuestions(currentModule.id);
        setQuestions(qList);
      } catch (e) {
        console.error('Failed to load questions', e);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [currentModule.id]);

  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Confirm if questions unanswered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const result = await circuitService.submitQuiz({
        userId: user.id,
        moduleId: currentModule.id,
        courseId: COURSE_ANALOG.id,
        answers: selectedAnswers,
      });

      setAttemptResult(result.attempt);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setAttemptResult(null);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>MODULE ASSESSMENT</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {currentModule.title} — Examination
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Passing Criteria: &ge; 70.0% (11 of 15 correct)
              </p>
            </div>

            <Link
              href={`/courses/analog-electronic-circuits/modules/${currentModule.slug}`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Review Lesson</span>
            </Link>
          </div>

          {/* Submission Results Banner */}
          {submitted && attemptResult && (
            <div
              className={`rounded-2xl border p-6 sm:p-8 space-y-4 animate-in fade-in duration-200 ${
                attemptResult.passed
                  ? 'border-emerald-700/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950'
                  : 'border-rose-800/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      attemptResult.passed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {attemptResult.passed ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <XCircle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        attemptResult.passed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {attemptResult.passed ? 'PASSED (QUALIFIED)' : 'FAILED (RETAKE REQUIRED)'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      Score: {attemptResult.score} / {attemptResult.total_questions} ({attemptResult.percentage}%)
                    </h2>
                    <p className="text-xs text-slate-400">
                      {attemptResult.passed
                        ? 'Congratulations! Module learning competency verified. Module is marked complete.'
                        : 'Minimum 70% required to clear this module. Review the explanations below and retake.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetake}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>

                  <Link
                    href="/courses/analog-electronic-circuits"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Syllabus
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Question Interface */}
          {currentQ && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
              {/* Progress Bar & Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span>
                    Answered: {answeredCount} / {totalQuestions}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="pt-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question_text}
                </h3>
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText =
                    optKey === 'A'
                      ? currentQ.option_a
                      : optKey === 'B'
                      ? currentQ.option_b
                      : optKey === 'C'
                      ? currentQ.option_c
                      : currentQ.option_d;

                  const isSelected = selectedAnswers[currentQ.id] === optKey;
                  const isCorrect = currentQ.correct_option === optKey;

                  let borderClass = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950';
                  let badgeClass = 'bg-slate-900 text-slate-400 border-slate-800';

                  if (submitted) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-600 bg-emerald-950/30';
                      badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-700';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-600 bg-rose-950/30';
                      badgeClass = 'bg-rose-950 text-rose-300 border-rose-700';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
                    badgeClass = 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold';
                  }

                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(currentQ.id, optKey)}
                      disabled={submitted}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${borderClass}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold border flex-shrink-0 mt-0.5 ${badgeClass}`}
                      >
                        {optKey}
                      </span>
                      <span className="text-sm text-slate-200 leading-relaxed flex-1">{optText}</span>
                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation in Review Mode */}
              {submitted && currentQ.explanation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs text-slate-300 space-y-1">
                  <p className="font-mono text-cyan-400 font-bold uppercase">
                    Engineering Rationale & Explanation:
                  </p>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Controls: Prev / Next / Submit */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  !submitted && (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
                    >
                      {submitting ? (
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit Assessment</span>
                        </>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Question Navigation Matrix */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-mono text-slate-400 uppercase">Question Jump Palette:</p>
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = !!selectedAnswers[q.id];
                    const isCurrent = idx === currentIndex;
                    let dotStyle = 'bg-slate-950 border-slate-800 text-slate-400';

                    if (submitted) {
                      const isCorrect = selectedAnswers[q.id] === q.correct_option;
                      dotStyle = isCorrect
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-rose-950 border-rose-600 text-rose-300';
                    } else if (isCurrent) {
                      dotStyle = 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold';
                    } else if (isAnswered) {
                      dotStyle = 'bg-slate-800 border-cyan-700 text-cyan-300';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-8 h-8 rounded-lg border text-xs font-mono flex items-center justify-center transition-all ${dotStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

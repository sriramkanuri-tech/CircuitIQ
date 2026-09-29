'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { COURSE_ANALOG } from '@/lib/seed/courseData';
import {
  Award,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Question, Certificate } from '@/types';

export default function FinalAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = (params.courseId as string) || COURSE_ANALOG.id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    certificate?: Certificate;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load questions
  useEffect(() => {
    async function init() {
      try {
        const qList = await circuitService.getFinalAssessmentQuestions();
        setQuestions(qList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (!timerActive || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, submitted, timeLeft]);

  const handleAutoSubmit = () => {
    alert('Time limit of 30 minutes has expired. Your answers will now be evaluated.');
    performSubmission();
  };

  const performSubmission = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setTimerActive(false);

    try {
      const res = await circuitService.submitFinalAssessment({
        userId: user.id,
        courseId,
        answers: selectedAnswers,
      });

      setResult(res);
      setSubmitted(true);

      // Trigger victory celebration if passed
      if (res.passed) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSubmit = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to finish and submit?`
      );
      if (!confirmSubmit) return;
    }
    performSubmission();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
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
  const answeredCount = Object.keys(selectedAnswers).length;
  const isTimeCritical = timeLeft < 5 * 60; // under 5 minutes

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
          {/* Header & Live Timer */}
          <div className="rounded-2xl border border-amber-800/50 bg-slate-900/90 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Award className="w-4 h-4" />
                <span>OFFICIAL CERTIFICATION EXAMINATION</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {COURSE_ANALOG.title} — Final Assessment
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                30 Items • Passing Standard: &ge; 70.0% (21/30 correct)
              </p>
            </div>

            {/* Countdown Timer Display */}
            {!submitted && (
              <div
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 font-mono font-bold text-base transition-colors ${
                  isTimeCritical
                    ? 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-cyan-400'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Results Summary if submitted */}
          {submitted && result && (
            <div
              className={`rounded-2xl border p-6 sm:p-8 space-y-6 animate-in fade-in duration-300 ${
                result.passed
                  ? 'border-emerald-600 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
                  : 'border-rose-700 bg-slate-900/95 shadow-xl'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    result.passed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                  }`}
                >
                  {result.passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>

                <div className="space-y-1.5 flex-1">
                  <span
                    className={`inline-block text-xs font-mono font-bold px-3 py-0.5 rounded-full ${
                      result.passed
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        : 'bg-rose-950 border border-rose-700 text-rose-300'
                    }`}
                  >
                    {result.passed ? 'PASSED WITH ACCREDITATION' : 'DID NOT MEET 70% THRESHOLD'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Final Examination Result: {result.score} / {result.total} ({result.percentage.toFixed(1)}%)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {result.passed
                      ? 'Outstanding achievement! Your certificate has been issued, cryptographically timestamped, and transmitted to your email.'
                      : 'You scored below the mandatory 70% threshold. You can retake the assessment after reviewing the module equations.'}
                  </p>
                </div>
              </div>

              {/* Certificate Quick Actions if Passed */}
              {result.passed && result.certificate && (
                <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-800/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-emerald-400 font-semibold">
                        AUTHENTICATED CREDENTIAL GENERATED:
                      </p>
                      <p className="text-lg font-mono font-bold text-white">
                        {result.certificate.certificate_number}
                      </p>
                      <p className="text-xs text-slate-400">
                        Recipient: {result.certificate.student_name} • Status: VERIFIED
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {result.certificate.pdf_path && (
                        <a
                          href={result.certificate.pdf_path}
                          download={`CircuitIQ-${result.certificate.certificate_number}.pdf`}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </a>
                      )}
                      <Link
                        href={`/verify/${result.certificate.certificate_number}`}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Public Verification</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Return to Dashboard
                </Link>
                {!result.passed && (
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setSubmitted(false);
                      setResult(null);
                      setTimeLeft(30 * 60);
                      setTimerActive(true);
                      setCurrentIndex(0);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Final Assessment</span>
                  </button>
                )}
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
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span>
                    Answered: {answeredCount} / {questions.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
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
                      onClick={() => {
                        if (!submitted) {
                          setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: optKey });
                        }
                      }}
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

              {/* Review explanation */}
              {submitted && currentQ.explanation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs text-slate-300 space-y-1">
                  <p className="font-mono text-cyan-400 font-bold uppercase">
                    Technical Solution & Formula:
                  </p>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Prev / Next / Submit Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  !submitted && (
                    <button
                      onClick={handleUserSubmit}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
                    >
                      {submitting ? (
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit Final Examination</span>
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

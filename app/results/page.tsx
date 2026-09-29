'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { LineChart, CheckCircle2, XCircle, Clock, Calendar, HelpCircle, ArrowRight } from 'lucide-react';
import { QuizAttempt } from '@/types';

export default function StudentResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const attList = await circuitService.getQuizAttempts(user.id);
      setAttempts(attList);
      setLoading(false);
    }
    if (user) {
      load();
    }
  }, [user]);

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
              <LineChart className="w-4 h-4" />
              <span>ACADEMIC PERFORMANCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Quiz Results & History</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Audit log of all module quizzes and examination evaluations recorded on your profile.
            </p>
          </div>

          {attempts.length === 0 ? (
            <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Assessment Results Recorded</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Begin module lessons and complete module quizzes to generate performance analytics.
              </p>
              <Link
                href="/courses/analog-electronic-circuits"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Go to Syllabus
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-4">Module / Quiz Title</th>
                      <th className="p-4">Attempt #</th>
                      <th className="p-4">Correct / Total</th>
                      <th className="p-4">Percentage</th>
                      <th className="p-4">Outcome</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span>{att.module_title || 'Module Quiz'}</span>
                        </td>
                        <td className="p-4 font-mono">#{att.attempt_number}</td>
                        <td className="p-4 font-mono font-semibold text-slate-100">
                          {att.score} / {att.total_questions}
                        </td>
                        <td className="p-4 font-mono font-bold text-sm">
                          <span className={att.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {att.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              att.passed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {att.passed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>PASSED</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>FAILED</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {new Date(att.attempted_at).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/quiz/${att.module_id}`}
                            className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                          >
                            <span>Retake</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

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
import { BookOpen, Clock, Layers, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CourseProgress } from '@/types';

export default function MyCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const prog = await circuitService.getCourseProgress(user.id, COURSE_ANALOG.id);
      setProgress(prog);
      setLoading(false);
    }
    if (user) {
      load();
    }
  }, [user]);

  const completedCount = progress.filter((p) => p.completed).length;
  const percent = Math.round((completedCount / MODULES_ANALOG.length) * 100);

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
              <BookOpen className="w-4 h-4" />
              <span>ENROLLED CURRICULUM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">My Active Courses</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Track your academic progress across enrolled technical programs.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                  UNDERGRADUATE / PROFESSIONAL
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{COURSE_ANALOG.title}</h2>
                <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                  {COURSE_ANALOG.description}
                </p>
              </div>

              <div className="text-right sm:self-start">
                <span className="text-2xl font-mono font-bold text-cyan-400">{percent}%</span>
                <p className="text-xs text-slate-500 font-mono">
                  {completedCount} of 15 Modules Complete
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~48 Hours Estimated
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" /> 15 Lessons & Quizzes
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/courses/analog-electronic-circuits"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <span>Continue Curriculum</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

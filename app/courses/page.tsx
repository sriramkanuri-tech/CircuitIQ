import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import { BookOpen, Clock, Layers, Award, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';

export default function CoursesCatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              CURRICULUM CATALOG
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              CircuitIQ Course Catalog
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Rigorous, accredited online engineering courses designed to bridge foundational physics with practical silicon and board-level design.
            </p>
          </div>

          {/* Featured Primary Course Card */}
          <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-bold">
                PRIMARY ACCREDITED TRACK
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                {COURSE_ANALOG.level}
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> ~{COURSE_ANALOG.estimated_hours} Hours
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> 15 Instructional Modules
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {COURSE_ANALOG.title}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                {COURSE_ANALOG.description}
              </p>
            </div>

            {/* Modules Grid Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {MODULES_ANALOG.map((mod) => (
                <div
                  key={mod.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
                    {mod.order_number < 10 ? `0${mod.order_number}` : mod.order_number}
                  </span>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{mod.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{mod.estimated_minutes} mins</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/courses/analog-electronic-circuits"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Course Syllabus</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/verify/AE-2026-8F4K29X"
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Inspect Sample Course Certificate &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

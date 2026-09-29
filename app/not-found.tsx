import React from 'react';
import Link from 'next/link';
import { CircuitLogo } from '@/components/ui/CircuitLogo';
import { AlertCircle, ArrowLeft, Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-8 text-center space-y-6 backdrop-blur-xl relative z-10">
        <div className="flex justify-center">
          <CircuitLogo size="md" showTagline={false} />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-cyan-400 font-bold text-4xl block">404</span>
          <h1 className="text-2xl font-extrabold text-white">Circuit Path Open / Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested analog node address does not exist or has been relocated to another schematic block.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/courses/analog-electronic-circuits"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Syllabus</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

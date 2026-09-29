'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import { Layers, Plus, Edit2, Trash2, ArrowUp, ArrowDown, CheckCircle2, Clock } from 'lucide-react';
import { CourseModule } from '@/types';

export default function AdminModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const list = await circuitService.getModules(COURSE_ANALOG.id);
      setModules(list);
    }
    load();
  }, []);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div className="p-8 text-center text-rose-400">403 Forbidden. Admin privilege required.</div>;
  }

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return;

    const copy = [...modules];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Reassign order numbers
    copy.forEach((m, idx) => {
      m.order_number = idx + 1;
    });

    setModules(copy);
    setMsg('Module sequence order re-indexed successfully.');
    setTimeout(() => setMsg(null), 2500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this instructional module?')) {
      setModules((prev) => prev.filter((m) => m.id !== id));
      setMsg('Module deleted.');
      setTimeout(() => setMsg(null), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                <Layers className="w-4 h-4" />
                <span>SYLLABUS STRUCTURING</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Module Management</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Organize, sequence, and manage educational content units for Analog Electronic Circuits.
              </p>
            </div>

            <div className="text-xs font-mono text-cyan-400">
              {modules.length} Modules in Active Sequence
            </div>
          </div>

          {msg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{msg}</span>
            </div>
          )}

          {/* Module Ordering List */}
          <div className="space-y-3">
            {modules.map((mod, index) => (
              <div
                key={mod.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {mod.order_number < 10 ? `0${mod.order_number}` : mod.order_number}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{mod.description}</p>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {mod.estimated_minutes} mins estimated
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMove(index, 'UP')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'DOWN')}
                    disabled={index === modules.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/courses/analog-electronic-circuits/modules/${mod.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono transition-colors"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => handleDelete(mod.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/40 text-rose-400 transition-colors"
                    title="Delete Module"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

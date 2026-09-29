'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Layers, Clock } from 'lucide-react';
import { Course } from '@/types';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const list = await circuitService.getCourses();
      setCourses(list);
    }
    load();
  }, []);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div className="p-8 text-center text-rose-400">403 Forbidden. Admin privilege required.</div>;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? { ...c, title, description, status } : c))
      );
      setMsg('Course specifications updated successfully.');
    } else {
      const newCourse: Course = {
        id: `c-custom-${Date.now()}`,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        level: 'Undergraduate / Professional',
        estimated_hours: 40,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCourses((prev) => [...prev, newCourse]);
      setMsg('New course published to catalog.');
    }
    setEditingCourse(null);
    setIsCreating(false);
    setTitle('');
    setDescription('');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEdit = (c: Course) => {
    setEditingCourse(c);
    setIsCreating(false);
    setTitle(c.title);
    setDescription(c.description);
    setStatus(c.status as any);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setMsg('Course removed.');
      setTimeout(() => setMsg(null), 3000);
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
                <BookOpen className="w-4 h-4" />
                <span>CURRICULUM ARCHITECTURE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Course Management</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Create, edit, publish, and configure courses on the platform.
              </p>
            </div>

            <button
              onClick={() => {
                setIsCreating(true);
                setEditingCourse(null);
                setTitle('');
                setDescription('');
                setStatus('PUBLISHED');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>

          {msg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{msg}</span>
            </div>
          )}

          {/* Form Modal / Drawer if editing or creating */}
          {(isCreating || editingCourse) && (
            <div className="p-6 rounded-2xl border border-amber-800/60 bg-slate-900/95 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">
                {editingCourse ? 'Edit Course Parameters' : 'Create New Technical Course'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. RF Circuit Design & Synthesis"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed description of course objectives and scope..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PUBLISHED">PUBLISHED (Active Catalog)</option>
                    <option value="DRAFT">DRAFT (Hidden from Students)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Save Course
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourse(null);
                      setIsCreating(false);
                    }}
                    className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses List */}
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        course.status === 'PUBLISHED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {course.status}
                    </span>
                    <span className="text-xs font-mono text-slate-500">ID: {course.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{course.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(course)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
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

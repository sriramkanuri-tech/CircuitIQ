'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  Search,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  ShieldCheck,
  ExternalLink,
  PlusCircle,
  Clock,
  Building,
} from 'lucide-react';
import { UserProfile } from '@/types';

export default function AdminStudentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadStudents = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const list = await circuitService.getAllStudents();
      setStudents(list);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      loadStudents();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800 text-center space-y-3">
          <h2 className="text-lg font-bold text-white">403 Unauthorized</h2>
          <p className="text-xs text-rose-300">Administrator credentials required to view this directory.</p>
        </div>
      </div>
    );
  }

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.college && s.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                <Users className="w-4 h-4" />
                <span>STUDENT BODY DIRECTORY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Student Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Track registered student accounts, institutional affiliations, and academic standing
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadStudents(true)}
                disabled={refreshing || loading}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-2"
                title="Refresh student list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh List'}</span>
              </button>

              <Link
                href="/admin/certificates"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Issue Certificate</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">Registered Students</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{students.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">Active Accounts</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{students.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-xs font-mono text-slate-400 uppercase">Primary Course</div>
              <div className="text-xs font-semibold text-slate-200 mt-2 truncate">
                Analog Electronic Circuits
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, email, college, or student ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs font-mono text-slate-400 hidden sm:block">
              Showing <strong>{filtered.length}</strong> of <strong>{students.length}</strong> students
            </div>
          </div>

          {/* Student Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Institutional Email</th>
                    <th className="py-3 px-4 font-semibold">University / College</th>
                    <th className="py-3 px-4 font-semibold">Student ID</th>
                    <th className="py-3 px-4 font-semibold">Registration Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <span className="inline-block w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p>Loading registered student accounts...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center space-y-3">
                        <Users className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-slate-400 text-sm font-semibold">
                          {searchTerm ? 'No student accounts match your search.' : 'No registered student accounts yet.'}
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          When students create accounts via the registration portal (<code>/register</code>), their profile details will be displayed here automatically.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs border border-cyan-500/40">
                              {s.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <span className="block font-semibold">{s.full_name}</span>
                              {s.mobile && (
                                <span className="text-[11px] text-slate-400 font-mono font-normal">
                                  {s.mobile}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-cyan-300 text-xs">
                          {s.email}
                        </td>

                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {s.college || <span className="text-slate-500 italic">Self-enrolled</span>}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                          {s.student_id || <span className="text-slate-500 italic">—</span>}
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-xs whitespace-nowrap">
                          {s.created_at
                            ? new Date(s.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '29 Sep 2026'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-medium text-xs transition-colors"
                            >
                              Dossier
                            </button>
                            <Link
                              href="/admin/certificates"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Issue Certificate to this Student"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Certify</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Details Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white">Student Academic Dossier</h3>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-slate-400 hover:text-white text-xs font-mono"
                  >
                    [Close]
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div>
                      <span className="text-slate-500 font-mono text-[11px]">Full Legal Name</span>
                      <p className="text-sm font-bold text-white mt-0.5">{selectedStudent.full_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[11px]">Email Address</span>
                      <p className="font-mono text-cyan-300 mt-0.5">{selectedStudent.email}</p>
                    </div>
                    {selectedStudent.mobile && (
                      <div>
                        <span className="text-slate-500 font-mono text-[11px]">Mobile Phone</span>
                        <p className="font-mono text-slate-200 mt-0.5">{selectedStudent.mobile}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div>
                      <span className="text-slate-500 font-mono text-[11px]">University / College</span>
                      <p className="text-slate-200 font-medium mt-0.5">
                        {selectedStudent.college || 'Self-enrolled Candidate'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[11px]">Student ID / Roll No</span>
                      <p className="font-mono text-slate-200 mt-0.5">
                        {selectedStudent.student_id || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[11px]">Enrolled Curriculum</span>
                      <p className="text-slate-200 mt-0.5">Analog Electronic Circuits</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[11px]">Account Created</span>
                      <p className="text-slate-300 font-mono mt-0.5">
                        {selectedStudent.created_at
                          ? new Date(selectedStudent.created_at).toLocaleString()
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href="/admin/certificates"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Issue Certificate</span>
                  </Link>

                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

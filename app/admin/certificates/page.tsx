'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { COURSE_ANALOG } from '@/lib/seed/courseData';
import { Certificate, UserProfile } from '@/types';
import {
  Award,
  Download,
  ExternalLink,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Search,
  PlusCircle,
  RefreshCw,
  X,
  FileCheck,
  Send,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual generation modal
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [confirmGenOpen, setConfirmGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    studentId: '',
    score: 85,
    issueDate: new Date().toISOString().split('T')[0],
    sendEmail: true,
  });

  // Revoke modal
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [targetCertToRevoke, setTargetCertToRevoke] = useState<Certificate | null>(null);

  // Regenerate modal
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [targetCertToRegen, setTargetCertToRegen] = useState<Certificate | null>(null);
  const [regenForm, setRegenForm] = useState({
    studentName: '',
    issueDate: '',
  });

  // Resend email modal
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [targetCertToResend, setTargetCertToResend] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certList, studentList] = await Promise.all([
        circuitService.getCertificates(),
        circuitService.getAllStudents(),
      ]);
      setCertificates(certList);
      setStudents(studentList);
      if (studentList.length > 0 && !genForm.studentId) {
        setGenForm((prev) => ({ ...prev, studentId: studentList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load certificates', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      loadData();
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
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">403 Unauthorized</h2>
          <p className="text-xs text-rose-300">Administrator access required.</p>
        </div>
      </div>
    );
  }

  // Handle Manual Generation Steps
  const handleOpenGenModal = () => {
    setGenModalOpen(true);
    setConfirmGenOpen(false);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.studentId) return;
    setConfirmGenOpen(true);
  };

  const handleConfirmGenerate = async () => {
    if (!user) return;
    setActionLoading('generating');
    setFeedback(null);

    try {
      const res = await circuitService.generateCertificateManual({
        adminUserId: user.id,
        studentId: genForm.studentId,
        courseId: COURSE_ANALOG.id,
        score: Number(genForm.score),
        issueDate: new Date(genForm.issueDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        sendEmail: genForm.sendEmail,
      });

      if (res.certificate) {
        setFeedback({
          type: 'success',
          message: `Certificate ${res.certificate.certificate_number} successfully generated and registered.`,
        });
        setGenModalOpen(false);
        setConfirmGenOpen(false);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to generate certificate.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Generation error occurred.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Revoke
  const openRevokeModal = (cert: Certificate) => {
    setTargetCertToRevoke(cert);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!user || !targetCertToRevoke) return;
    setActionLoading(targetCertToRevoke.id);
    setFeedback(null);

    try {
      const res = await circuitService.revokeCertificate(user.id, targetCertToRevoke.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Certificate ${targetCertToRevoke.certificate_number} has been revoked. Public verification will reflect REVOKED status.`,
        });
        setRevokeModalOpen(false);
        setTargetCertToRevoke(null);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to revoke certificate.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Revocation error.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Regenerate
  const openRegenModal = (cert: Certificate) => {
    setTargetCertToRegen(cert);
    setRegenForm({
      studentName: cert.student_name || '',
      issueDate: cert.issue_date || new Date().toISOString().split('T')[0],
    });
    setRegenModalOpen(true);
  };

  const handleConfirmRegen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetCertToRegen) return;
    setActionLoading(targetCertToRegen.id);
    setFeedback(null);

    try {
      const res = await circuitService.regenerateCertificate(user.id, targetCertToRegen.id, {
        studentName: regenForm.studentName,
        issueDate: regenForm.issueDate,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Certificate ${targetCertToRegen.certificate_number} regenerated successfully with updated PDF.`,
        });
        setRegenModalOpen(false);
        setTargetCertToRegen(null);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to regenerate certificate.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Regeneration error.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Resend Email
  const openResendModal = (cert: Certificate) => {
    setTargetCertToResend(cert);
    setResendModalOpen(true);
  };

  const handleConfirmResend = async () => {
    if (!targetCertToResend) return;
    setActionLoading(targetCertToResend.id);
    setFeedback(null);

    try {
      const res = await circuitService.resendCertificateEmail(user.id, targetCertToResend.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Certificate email successfully dispatched to ${targetCertToResend.student_email || 'student'}.`,
        });
        setResendModalOpen(false);
        setTargetCertToResend(null);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to resend email.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Email dispatch error.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.certificate_number.toLowerCase().includes(term) ||
      (c.student_name && c.student_name.toLowerCase().includes(term)) ||
      (c.student_email && c.student_email.toLowerCase().includes(term))
    );
  });

  const selectedStudentForGen = students.find((s) => s.id === genForm.studentId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400">
                  CREDENTIAL ISSUANCE AUTHORITY
                </span>
                <span className="text-xs text-slate-400 font-mono">Accreditation Registry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Certificate Management & Issuance
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manually issue credentials, audit QR verifications, regenerate PDF artifacts, and manage revocation
              </p>
            </div>

            <button
              onClick={handleOpenGenModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate Certificate</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by certificate ID, student name, or email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs font-mono text-slate-400">
              Total Certificates: <strong>{certificates.length}</strong>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Certificate ID</th>
                    <th className="py-3 px-4 font-semibold">Student Recipient</th>
                    <th className="py-3 px-4 font-semibold">Course & Score</th>
                    <th className="py-3 px-4 font-semibold">Issue Date</th>
                    <th className="py-3 px-4 font-semibold">Origin</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <span className="inline-block w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p>Loading certificate registry...</p>
                      </td>
                    </tr>
                  ) : filteredCerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No certificates matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCerts.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* ID */}
                        <td className="py-3 px-4">
                          <Link
                            href={`/verify/${cert.certificate_number}`}
                            className="font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                            target="_blank"
                          >
                            <span>{cert.certificate_number}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        </td>

                        {/* Student */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">
                            {cert.student_name || 'Enrolled Student'}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                            {cert.student_email || 'Verified Account'}
                          </div>
                        </td>

                        {/* Course & Score */}
                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium text-xs truncate max-w-[160px]">
                            {cert.course_title || 'Analog Electronic Circuits'}
                          </div>
                          <div className="text-emerald-400 font-mono font-bold text-xs">
                            {cert.score.toFixed(1)}% Score
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">
                          {cert.issue_date}
                        </td>

                        {/* Origin */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {cert.generated_by || 'SYSTEM'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              cert.status === 'VALID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cert.status === 'VALID' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            {cert.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Download PDF */}
                            {cert.pdf_path && (
                              <a
                                href={cert.pdf_path}
                                download={`CircuitIQ-Certificate-${cert.certificate_number}.pdf`}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Download Certificate PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Resend Email */}
                            <button
                              onClick={() => openResendModal(cert)}
                              disabled={actionLoading === cert.id}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors"
                              title="Resend Certificate Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            {/* Regenerate */}
                            <button
                              onClick={() => openRegenModal(cert)}
                              disabled={actionLoading === cert.id}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                              title="Regenerate Certificate PDF"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Revoke */}
                            {cert.status === 'VALID' ? (
                              <button
                                onClick={() => openRevokeModal(cert)}
                                disabled={actionLoading === cert.id}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>Revoke</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-mono text-rose-400 italic px-2">
                                Revoked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL 1: Manual Generation Form */}
          {genModalOpen && !confirmGenOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Manual Certificate Issuance</h3>
                      <p className="text-xs text-slate-400">Issue an accredited credential on behalf of administration</p>
                    </div>
                  </div>
                  <button onClick={() => setGenModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleProceedToConfirm} className="space-y-4">
                  {/* Student Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Target Student Recipient *
                    </label>
                    {students.length > 0 ? (
                      <select
                        value={genForm.studentId}
                        onChange={(e) => setGenForm({ ...genForm, studentId: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        {students.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.full_name} ({st.email}) — {st.college || 'CircuitIQ'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                        No students currently registered. Please have a student register first.
                      </div>
                    )}
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Course</label>
                    <input
                      type="text"
                      disabled
                      value={COURSE_ANALOG.title}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Score & Issue Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Assessment Score (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        value={genForm.score}
                        onChange={(e) => setGenForm({ ...genForm, score: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Issue Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={genForm.issueDate}
                        onChange={(e) => setGenForm({ ...genForm, issueDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Send Email Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={genForm.sendEmail}
                        onChange={(e) => setGenForm({ ...genForm, sendEmail: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300">
                        Send Certificate Email immediately with attached PDF
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setGenModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!genForm.studentId}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      Next: Review & Confirm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: Generation Confirmation Dialog (Requirement 20) */}
          {confirmGenOpen && selectedStudentForGen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Confirm Certificate Issuance</h3>
                    <p className="text-xs text-slate-400">
                      Are you sure you want to generate a certificate for this student?
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Name:</span>
                    <strong className="text-slate-100">{selectedStudentForGen.full_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Email:</span>
                    <span className="font-mono text-cyan-300">{selectedStudentForGen.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Course:</span>
                    <span className="text-slate-300">{COURSE_ANALOG.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Score:</span>
                    <span className="font-mono font-bold text-emerald-400">{genForm.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="font-mono text-slate-300">{genForm.issueDate}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Email Dispatch:</span>
                    <span className="text-slate-300">
                      {genForm.sendEmail
                        ? `Will be sent to ${selectedStudentForGen.email}`
                        : 'No email dispatch requested'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmGenOpen(false)}
                    disabled={actionLoading === 'generating'}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmGenerate}
                    disabled={actionLoading === 'generating'}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {actionLoading === 'generating' ? (
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Confirm &amp; Generate</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 3: Revocation Confirmation (Requirement 23) */}
          {revokeModalOpen && targetCertToRevoke && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Revoke Credential</h3>
                    <p className="text-xs text-rose-400">Critical Administrative Action</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Are you sure you want to revoke this certificate?
                </p>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200">
                  This certificate will no longer be valid upon verification. Public verification at{' '}
                  <code className="text-rose-300 font-mono">/verify/{targetCertToRevoke.certificate_number}</code>{' '}
                  will permanently display <strong>&quot;Certificate Revoked&quot;</strong>.
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate ID:</span>
                    <strong className="font-mono text-cyan-300">
                      {targetCertToRevoke.certificate_number}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student:</span>
                    <span className="text-slate-200">{targetCertToRevoke.student_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRevokeModalOpen(false)}
                    disabled={actionLoading === targetCertToRevoke.id}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRevoke}
                    disabled={actionLoading === targetCertToRevoke.id}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {actionLoading === targetCertToRevoke.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Confirm Revocation</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 4: Regenerate Certificate (Requirement 24) */}
          {regenModalOpen && targetCertToRegen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Regenerate Certificate PDF</h3>
                    <p className="text-xs text-slate-400">
                      ID: <span className="font-mono text-cyan-300">{targetCertToRegen.certificate_number}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Update student name typos or issue dates. The unique verification URL will remain preserved.
                </p>

                <form onSubmit={handleConfirmRegen} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Student Name on Certificate
                    </label>
                    <input
                      type="text"
                      required
                      value={regenForm.studentName}
                      onChange={(e) => setRegenForm({ ...regenForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Issue Date</label>
                    <input
                      type="text"
                      required
                      value={regenForm.issueDate}
                      onChange={(e) => setRegenForm({ ...regenForm, issueDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRegenModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === targetCertToRegen.id}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-2"
                    >
                      {actionLoading === targetCertToRegen.id ? (
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Regenerate PDF</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 5: Resend Email Confirmation (Requirement 22) */}
          {resendModalOpen && targetCertToResend && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Resend Certificate Email</h3>
                    <p className="text-xs text-slate-400">Transactional Email Dispatch</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300">
                  Resend certificate to{' '}
                  <strong className="font-mono text-cyan-300">
                    {targetCertToResend.student_email || 'student'}
                  </strong>
                  ?
                </p>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="text-slate-200">{targetCertToResend.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate ID:</span>
                    <span className="font-mono text-cyan-400">
                      {targetCertToResend.certificate_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResendModalOpen(false)}
                    disabled={actionLoading === targetCertToResend.id}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResend}
                    disabled={actionLoading === targetCertToResend.id}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {actionLoading === targetCertToResend.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Dispatch Email</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

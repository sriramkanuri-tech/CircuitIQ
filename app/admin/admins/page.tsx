'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth, PERMANENT_OWNER_EMAIL } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { UserProfile, UserRole } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Calendar,
  Mail,
  User,
  Crown,
  RefreshCw,
} from 'lucide-react';

export default function AdminManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');

  // Confirmation dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'PROMOTE' | 'DEMOTE' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.email?.toLowerCase().trim() === PERMANENT_OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const all = await circuitService.getAllUsers();
      setUsers(all);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin) {
      loadUsers();
    }
  }, [user, isSuperAdmin]);

  const openActionModal = (target: UserProfile, type: 'PROMOTE' | 'DEMOTE') => {
    setSelectedUser(target);
    setActionType(type);
    setModalOpen(true);
    setFeedbackMsg(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!user || !selectedUser || !actionType) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      if (actionType === 'PROMOTE') {
        const res = await circuitService.promoteToAdmin(user.id, selectedUser.id);
        if (res.success) {
          setFeedbackMsg({
            type: 'success',
            message: `User ${selectedUser.full_name} successfully promoted to administrator.`,
          });
          await loadUsers();
          closeModal();
        } else {
          setFeedbackMsg({ type: 'error', message: res.error || 'Failed to promote user.' });
        }
      } else if (actionType === 'DEMOTE') {
        const res = await circuitService.demoteAdminToStudent(user.id, selectedUser.id);
        if (res.success) {
          setFeedbackMsg({
            type: 'success',
            message: `Administrator privileges successfully removed for ${selectedUser.full_name}.`,
          });
          await loadUsers();
          closeModal();
        } else {
          setFeedbackMsg({ type: 'error', message: res.error || 'Failed to remove admin privileges.' });
        }
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.message || 'Action failed unexpectedly.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === 'ALL'
        ? true
        : roleFilter === 'SUPER_ADMIN'
        ? u.role === 'SUPER_ADMIN' || u.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()
        : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400">
                  SUPER ADMIN AUTHORIZED
                </span>
                <span className="text-xs text-slate-400 font-mono">Role Access Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Administrator & Privilege Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Grant and revoke administrator credentials with server-verified role integrity
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
                title="Refresh user directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Owner: <strong>{PERMANENT_OWNER_EMAIL}</strong></span>
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <span>{feedbackMsg.message}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-400 hover:text-white ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Restricted Warning if not Super Admin */}
          {!isSuperAdmin ? (
            <div className="p-8 rounded-2xl bg-amber-950/30 border border-amber-800/80 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Privileged Section Restricted</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Only the designated Platform Owner (<code>{PERMANENT_OWNER_EMAIL}</code>) holds permissions
                to access the Admin Management console and promote or demote platform administrators.
              </p>
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or institutional ID..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
                  {(['ALL', 'STUDENT', 'ADMIN', 'SUPER_ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        roleFilter === r
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r === 'ALL'
                        ? 'All Users'
                        : r === 'SUPER_ADMIN'
                        ? 'Owner'
                        : r === 'ADMIN'
                        ? 'Admins'
                        : 'Students'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">User Details</th>
                        <th className="py-3 px-4 font-semibold">Institutional Email</th>
                        <th className="py-3 px-4 font-semibold">Current Role</th>
                        <th className="py-3 px-4 font-semibold">Registration Date</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <span className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                            <p>Loading registered accounts...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            No registered users match your search parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isTargetOwner =
                            u.email.toLowerCase().trim() === PERMANENT_OWNER_EMAIL.toLowerCase();

                          return (
                            <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                              {/* Name & Academic ID */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                      isTargetOwner
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                        : u.role === 'ADMIN'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}
                                  >
                                    {isTargetOwner ? (
                                      <Crown className="w-4 h-4 text-amber-400" />
                                    ) : (
                                      u.full_name?.charAt(0) || 'U'
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                                      <span>{u.full_name}</span>
                                      {isTargetOwner && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-700 text-amber-400">
                                          PRIMARY
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                      {u.college || 'CircuitIQ Learner'}
                                      {u.student_id ? ` • ${u.student_id}` : ''}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                                {u.email}
                              </td>

                              {/* Role */}
                              <td className="py-3 px-4">
                                {isTargetOwner ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-semibold">
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    Platform Owner
                                  </span>
                                ) : u.role === 'ADMIN' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700 text-indigo-300 text-xs font-semibold">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                    Administrator
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    Student
                                  </span>
                                )}
                              </td>

                              {/* Registration Date */}
                              <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '29 Sep 2026'}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                {isTargetOwner ? (
                                  <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60">
                                    Platform Owner
                                  </span>
                                ) : u.role === 'ADMIN' ? (
                                  <button
                                    onClick={() => openActionModal(u, 'DEMOTE')}
                                    className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Remove Admin</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openActionModal(u, 'PROMOTE')}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/80 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Make Admin</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Confirmation Dialog Modal */}
          {modalOpen && selectedUser && actionType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        actionType === 'PROMOTE'
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {actionType === 'PROMOTE' ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {actionType === 'PROMOTE' ? 'Promote User to Administrator' : 'Revoke Administrator Privileges'}
                    </h3>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {actionType === 'PROMOTE'
                    ? 'Are you sure you want to make this user an administrator?'
                    : 'Are you sure you want to remove administrator privileges from this user?'}
                </p>

                {/* Target User Details Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">User Name:</span>
                    <strong className="text-slate-100">{selectedUser.full_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">User Email:</span>
                    <span className="font-mono text-cyan-300">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Role Transition:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {actionType === 'PROMOTE' ? 'STUDENT → ADMIN' : 'ADMIN → STUDENT'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-slate-300 leading-relaxed">
                  {actionType === 'PROMOTE'
                    ? 'Administrator privileges include course authoring, module modification, question banking, student management, and certificate issuance.'
                    : 'Revoking privileges will return this account to a student role. Existing course completions will remain intact.'}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    disabled={actionLoading}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                      actionType === 'PROMOTE'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    }`}
                  >
                    {actionLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{actionType === 'PROMOTE' ? 'Confirm Promotion' : 'Confirm Demotion'}</span>
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

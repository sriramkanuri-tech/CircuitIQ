'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { AuditLog } from '@/types';
import {
  FileText,
  Search,
  ShieldCheck,
  RefreshCw,
  Award,
  AlertTriangle,
  UserCheck,
  UserX,
  Mail,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await circuitService.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ADMIN_PROMOTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-700 text-indigo-300 text-xs font-mono font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            ADMIN_PROMOTION
          </span>
        );
      case 'ADMIN_DEMOTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950 border border-amber-700 text-amber-300 text-xs font-mono font-semibold">
            <UserX className="w-3.5 h-3.5 text-amber-400" />
            ADMIN_DEMOTION
          </span>
        );
      case 'CERTIFICATE_GENERATED_MANUAL':
      case 'CERTIFICATE_ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-semibold">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            CERT_ISSUED
          </span>
        );
      case 'CERTIFICATE_REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950 border border-rose-700 text-rose-300 text-xs font-mono font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            CERT_REVOKED
          </span>
        );
      case 'CERTIFICATE_REGENERATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-mono font-semibold">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            CERT_REGENERATED
          </span>
        );
      case 'EMAIL_RESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-950 border border-blue-700 text-blue-300 text-xs font-mono font-semibold">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            EMAIL_RESENT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
            {action}
          </span>
        );
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.target_user_email && l.target_user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.target_cert_id && l.target_cert_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      actionFilter === 'ALL'
        ? true
        : l.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

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
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  SECURITY & COMPLIANCE
                </span>
                <span className="text-xs text-slate-400 font-mono">Immutable Audit Trail</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                System Audit Trail & Security Logs
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Track all administrative actions, role modifications, certificate issuances, and email dispatches
              </p>
            </div>

            <button
              onClick={loadLogs}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* Search & Action Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by administrator, target email, or details..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
              {[
                { id: 'ALL', label: 'All Actions' },
                { id: 'PROMOTION', label: 'Promotions' },
                { id: 'DEMOTION', label: 'Demotions' },
                { id: 'CERT', label: 'Certificates' },
                { id: 'EMAIL', label: 'Emails' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActionFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    actionFilter === f.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Administrator</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Target / Subject</th>
                    <th className="py-3 px-4 font-semibold">State Transition</th>
                    <th className="py-3 px-4 font-semibold">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <span className="inline-block w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p>Loading security audit records...</p>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No audit records recorded for this filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {new Date(log.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-slate-500">
                              {new Date(log.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Admin */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{log.admin_name}</div>
                          <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                            {log.admin_email}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Target */}
                        <td className="py-3 px-4">
                          {log.target_user_email ? (
                            <span className="font-mono text-cyan-300 text-xs truncate max-w-[160px] block">
                              {log.target_user_email}
                            </span>
                          ) : log.target_cert_id ? (
                            <span className="font-mono text-amber-300 text-xs">
                              {log.target_cert_id}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Global / System</span>
                          )}
                        </td>

                        {/* Transition */}
                        <td className="py-3 px-4 font-mono text-xs">
                          {log.previous_value && log.new_value ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                                {log.previous_value}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                                {log.new_value}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4 text-xs text-slate-300 max-w-sm">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { Mail, CheckCircle2, XCircle, Clock, Search, RefreshCw, Send } from 'lucide-react';
import { EmailLog } from '@/types';

export default function AdminEmailLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const list = await circuitService.getEmailLogs();
    setLogs(list);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div className="p-8 text-center text-rose-400">403 Forbidden. Admin privilege required.</div>;
  }

  const filtered = logs.filter(
    (l) =>
      l.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Mail className="w-4 h-4" />
                <span>TRANSACTIONAL DISPATCH AUDIT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Email Delivery Logs</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Monitor Resend outbound email transmissions, delivery statuses, and certificate notifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadLogs}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
                title="Refresh Logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter recipient or type..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Email Subject</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Dispatched At</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No email transaction records found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-semibold text-white">
                          {log.recipient_email}
                        </td>
                        <td className="p-4 text-slate-200 max-w-xs truncate">{log.subject}</td>
                        <td className="p-4 font-mono text-[11px] text-cyan-400">{log.email_type}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              log.status === 'SENT'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {log.status === 'SENT' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>DELIVERED</span>
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
                          {new Date(log.sent_at).toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-mono text-[11px] text-slate-500">
                          {log.error_message || 'SMTP 250 OK'}
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

      <Footer />
    </div>
  );
}

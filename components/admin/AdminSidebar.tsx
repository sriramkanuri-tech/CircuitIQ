'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, PERMANENT_OWNER_EMAIL } from '@/lib/auth/context';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  HelpCircle,
  Users,
  UserCheck,
  Award,
  Mail,
  ShieldAlert,
  ShieldCheck,
  FileText,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.email?.toLowerCase().trim() === PERMANENT_OWNER_EMAIL;

  const navItems = [
    { label: 'Overview & Analytics', href: '/admin', icon: LayoutDashboard },
    { label: 'Admin Management', href: '/admin/admins', icon: ShieldCheck, superOnly: true },
    { label: 'Course Management', href: '/admin/courses', icon: BookOpen },
    { label: 'Module Management', href: '/admin/modules', icon: Layers },
    { label: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
    { label: 'Student Registry', href: '/admin/students', icon: Users },
    { label: 'Certificates & Revoke', href: '/admin/certificates', icon: Award },
    { label: 'Email Logs & Resend', href: '/admin/email-logs', icon: Mail },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Admin Badge */}
      <div className={`p-4 border-b border-slate-800/80 ${isSuperAdmin ? 'bg-indigo-950/30' : 'bg-amber-950/20'}`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shadow-md ${
              isSuperAdmin
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            }`}
          >
            {isSuperAdmin ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <h4
              className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                isSuperAdmin ? 'text-indigo-400' : 'text-amber-400'
              }`}
            >
              {isSuperAdmin ? 'Platform Owner' : 'Administrator'}
            </h4>
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.full_name || (isSuperAdmin ? 'Platform Owner' : 'Administrator')}
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.superOnly && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-900/60 border border-indigo-700/60 text-indigo-300">
                  SUPER
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-slate-800/80 mt-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Sign Out */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  User,
  Settings,
  LogOut,
  LineChart,
  ShieldAlert,
} from 'lucide-react';
import { CircuitLogo } from '@/components/ui/CircuitLogo';

export const StudentSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/my-courses', icon: BookOpen },
    { label: 'Module Quizzes', href: '/courses/analog-electronic-circuits', icon: HelpCircle },
    { label: 'Quiz Results', href: '/results', icon: LineChart },
    { label: 'My Certificates', href: '/certificates', icon: Award },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* User Micro Profile */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-sm shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-100 truncate">
              {user?.full_name || 'Student'}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono truncate">{user?.student_id || 'ID: STAN-EE'}</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {user?.role === 'ADMIN' && (
          <div className="pt-3 border-t border-slate-800/80 mt-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-400 bg-amber-950/20 border border-amber-900/40 hover:bg-amber-950/40 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom Sign Out */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

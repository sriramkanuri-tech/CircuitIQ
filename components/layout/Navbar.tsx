'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircuitLogo } from '@/components/ui/CircuitLogo';
import { useAuth } from '@/lib/auth/context';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Award,
  BookOpen,
  Info,
  Mail,
  ChevronRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'About', href: '/about' },
    { label: 'Verify Certificate', href: '/verify' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center">
          <CircuitLogo size="sm" showTagline={false} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive(link.href)
                  ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:border-cyan-500/50 transition-colors text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/40">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="text-slate-200 font-medium max-w-[130px] truncate">
                  {user.full_name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                  {user.role}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-lg shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800/80">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-slate-100 truncate">{user.email}</p>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-950/40 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Admin Control Panel
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    Student Dashboard
                  </Link>

                  <Link
                    href="/certificates"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    My Certificates
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile & Academic ID
                  </Link>

                  <div className="border-t border-slate-800/80 my-1" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/98 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-900 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{user.full_name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-cyan-950 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 bg-cyan-950/30 rounded-lg"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  Student Dashboard
                </Link>

                <Link
                  href="/certificates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  My Certificates
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md"
                >
                  Create Student Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

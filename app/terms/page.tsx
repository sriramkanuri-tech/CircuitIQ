import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-white">Terms of Academic Accreditation & Service</h1>
        <p className="text-xs text-slate-400 font-mono">Effective: 2026 Academic Cycle</p>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            By accessing CircuitIQ, students and institutional affiliates agree to adhere strictly to
            academic integrity standards. Certification issuance requires individual mastery demonstrated
            without unapproved automated aids during the timed comprehensive final assessment.
          </p>
          <h2 className="text-base font-bold text-white pt-2">Credential Validity & Revocation</h2>
          <p>
            CircuitIQ retains the authoritative right to revoke any certificate ID found to have been
            obtained through academic dishonesty or simulated identity falsification. Once revoked, the
            public QR verification record permanently indicates the revoked status.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

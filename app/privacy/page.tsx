import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-white">Academic Privacy Policy</h1>
        <p className="text-xs text-slate-400 font-mono">Effective: 2026 Academic Cycle</p>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            CircuitIQ respects the privacy of students and researchers. Personal identifiers including
            full name and university affiliation are securely preserved and utilized solely for
            official certificate issuance and verification.
          </p>
          <h2 className="text-base font-bold text-white pt-2">Public Verification Disclosures</h2>
          <p>
            Public certificate verification endpoints (<code className="text-cyan-400 font-mono">/verify/[certificateId]</code>)
            disclose only non-sensitive educational accreditation data: the student recipient name, course
            title, examination score, and issue date. Private contact details, passwords, and internal
            system tokens are never exposed.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

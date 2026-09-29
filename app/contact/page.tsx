'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Building2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    type: 'Academic Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              COMMUNICATION & SUPPORT
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get in Touch with CircuitIQ
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Have questions regarding course modules, institutional licensing, or certificate verification? Our academic team is here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Academic Headquarters
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  CircuitIQ Academic Certification Board & Curriculum Development Group
                </p>

                <div className="space-y-4 pt-3 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Electronic Mail</p>
                      <p className="font-mono text-cyan-300">support@circuitiq.edu</p>
                      <p className="font-mono text-slate-400 text-xs">certificates@circuitiq.edu</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Direct Academic Office</p>
                      <p className="font-mono text-slate-200">+1 (617) 555-0199</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Center for Microelectronics</p>
                      <p className="text-slate-200 text-xs">77 Massachusetts Avenue, Cambridge, MA 02139</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast verification callout */}
              <div className="p-6 rounded-2xl border border-cyan-800/40 bg-cyan-950/20 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300">Looking to Verify a Credential?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Employers and academic institutions do not need to contact support to authenticate certificates.
                  Instant validation is available at <code className="text-cyan-400">/verify/[certificateId]</code>.
                </p>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Message Transmitted</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting CircuitIQ. Your message has been logged in our academic inquiry
                      system. A faculty advisor or system engineer will reply to <span className="text-cyan-400 font-mono">{form.email}</span> within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Prof. Jane Doe"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="jane.doe@university.edu"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Inquiry Type
                        </label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm({ ...form, type: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Academic Inquiry">Academic Curriculum Question</option>
                          <option value="Certificate Verification">Certificate Verification</option>
                          <option value="University Licensing">University / College Partnership</option>
                          <option value="Technical Support">Technical Platform Support</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Subject *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="Query regarding BJT small-signal models"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Detailed Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Provide relevant details or questions regarding your coursework or accreditation..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transmit Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Activity, Zap, Check, Eye } from 'lucide-react';

export const CircuitHeroVisual: React.FC = () => {
  const [activeTestPoint, setActiveTestPoint] = useState<string | null>('TP3');

  const testPoints: Record<string, { label: string; voltage: string; frequency: string; note: string }> = {
    TP1: {
      label: 'TP1 (Transducer Input)',
      voltage: '100 mV (Peak-to-Peak)',
      frequency: '1.00 kHz Sine',
      note: 'Low-amplitude sensor signal with high source impedance (10 kΩ)',
    },
    TP2: {
      label: 'TP2 (BJT Q-Point Base)',
      voltage: '0.685 V DC Bias',
      frequency: 'DC + 25 mV AC',
      note: 'Forward-active mode base-emitter bias point stabilized by voltage divider',
    },
    TP3: {
      label: 'TP3 (Op-Amp Output Stage)',
      voltage: '5.00 V (Peak-to-Peak)',
      frequency: '1.00 kHz Sine (Av = -50)',
      note: 'Low-distortion conditioned signal ready for ADC sampling or load driver',
    },
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 overflow-hidden backdrop-blur-xl">
      {/* Background Circuit Grid */}
      <div className="absolute inset-0 circuit-grid opacity-25 pointer-events-none" />

      {/* Top Header of Simulated Instrument */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 font-semibold ml-2">
            OSCILLOSCOPE & SCHEMATIC ANALYZER v2.6
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            REALTIME AC SIMULATION
          </span>
        </div>
      </div>

      {/* Interactive Electronic Schematic Diagram (SVG) */}
      <div className="relative bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
        <svg
          viewBox="0 0 520 220"
          className="w-full h-auto text-slate-300 font-mono text-[9px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Signal Generation Source */}
          <circle cx="40" cy="110" r="16" stroke="#06b6d4" strokeWidth="1.8" fill="#0b1324" />
          <path
            d="M32 110 Q 36 100, 40 110 T 48 110"
            stroke="#22d3ee"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <text x="32" y="140" fill="#94a3b8">Vin (AC)</text>

          {/* Trace from Source to Resistor R1 */}
          <path d="M56 110 H100" stroke="#06b6d4" strokeWidth="1.8" />
          {/* Test Point 1 */}
          <circle
            cx="75"
            cy="110"
            r="5"
            fill={activeTestPoint === 'TP1' ? '#06b6d4' : '#1e293b'}
            stroke="#06b6d4"
            strokeWidth="1.5"
            className="cursor-pointer hover:scale-125 transition-transform"
            onClick={() => setActiveTestPoint('TP1')}
          />
          <text x="68" y="98" fill="#06b6d4" fontWeight="bold">TP1</text>

          {/* Resistor R1 (IEEE zigzag) */}
          <path
            d="M100 110 L105 102 L113 118 L121 102 L129 118 L137 102 L145 118 L150 110 H170"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <text x="115" y="92" fill="#38bdf8">R1 (10k)</text>

          {/* Node leading to BJT Transistor Base */}
          <circle cx="170" cy="110" r="3" fill="#38bdf8" />
          <path d="M170 110 H190" stroke="#38bdf8" strokeWidth="1.8" />

          {/* Test Point 2 */}
          <circle
            cx="180"
            cy="110"
            r="5"
            fill={activeTestPoint === 'TP2' ? '#f59e0b' : '#1e293b'}
            stroke="#f59e0b"
            strokeWidth="1.5"
            className="cursor-pointer hover:scale-125 transition-transform"
            onClick={() => setActiveTestPoint('TP2')}
          />
          <text x="173" y="98" fill="#f59e0b" fontWeight="bold">TP2</text>

          {/* BJT Transistor NPN Symbol */}
          <circle cx="215" cy="110" r="22" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
          {/* Base bar */}
          <line x1="195" y1="95" x2="195" y2="125" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Collector branch */}
          <line x1="195" y1="102" x2="215" y2="85" stroke="#cbd5e1" strokeWidth="1.8" />
          <line x1="215" y1="85" x2="215" y2="50" stroke="#cbd5e1" strokeWidth="1.8" />
          {/* Collector Resistor Rc to Vcc */}
          <path
            d="M215 50 V40 L210 37 L220 31 L210 25 L220 19 L215 15 V10"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <text x="222" y="32" fill="#94a3b8">Rc</text>
          <text x="210" y="8" fill="#ef4444" fontWeight="bold">+15V Vcc</text>

          {/* Emitter branch with arrow */}
          <line x1="195" y1="118" x2="215" y2="135" stroke="#cbd5e1" strokeWidth="1.8" />
          {/* Arrowhead */}
          <polygon points="215,135 206,132 210,126" fill="#cbd5e1" />
          {/* Emitter to Ground with Resistor Re */}
          <line x1="215" y1="135" x2="215" y2="160" stroke="#cbd5e1" strokeWidth="1.8" />
          <line x1="205" y1="160" x2="225" y2="160" stroke="#64748b" strokeWidth="1.5" />
          <line x1="210" y1="164" x2="220" y2="164" stroke="#64748b" strokeWidth="1.5" />
          <line x1="213" y1="168" x2="217" y2="168" stroke="#64748b" strokeWidth="1.5" />

          {/* Coupling Capacitor C1 */}
          <path d="M215 85 H260" stroke="#38bdf8" strokeWidth="1.8" />
          {/* Capacitor plates */}
          <line x1="260" y1="75" x2="260" y2="95" stroke="#22d3ee" strokeWidth="2.5" />
          <line x1="266" y1="75" x2="266" y2="95" stroke="#22d3ee" strokeWidth="2.5" />
          <text x="254" y="68" fill="#22d3ee">C1 (10uF)</text>
          <path d="M266 85 H305" stroke="#38bdf8" strokeWidth="1.8" />

          {/* Operational Amplifier Triangle */}
          <polygon
            points="310,50 310,150 395,100"
            stroke="#06b6d4"
            strokeWidth="2"
            fill="#081528"
          />
          {/* Inverting (-) Input */}
          <text x="316" y="80" fill="#f87171" fontSize="13" fontWeight="bold">-</text>
          {/* Non-inverting (+) Input */}
          <text x="316" y="130" fill="#4ade80" fontSize="12" fontWeight="bold">+</text>
          <line x1="305" y1="85" x2="310" y2="85" stroke="#38bdf8" strokeWidth="1.8" />
          {/* Non-inverting tied to ground */}
          <line x1="300" y1="126" x2="310" y2="126" stroke="#64748b" strokeWidth="1.5" />
          <line x1="300" y1="126" x2="300" y2="140" stroke="#64748b" strokeWidth="1.5" />
          <line x1="295" y1="140" x2="305" y2="140" stroke="#64748b" strokeWidth="1.5" />

          {/* Feedback Resistor Rf across Op-Amp */}
          <path d="M305 85 V60 H335" stroke="#38bdf8" strokeWidth="1.5" />
          <path
            d="M335 60 L340 54 L348 66 L356 54 L364 66 L372 54 L380 66 L385 60 H415"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <text x="350" y="48" fill="#38bdf8">Rf (500k)</text>
          <path d="M415 60 V100" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Diode Clamping Protection 1N4148 */}
          <path d="M305 85 V102 H300" stroke="#94a3b8" strokeWidth="1.2" />
          <polygon points="295,97 295,107 287,102" stroke="#94a3b8" fill="#334155" strokeWidth="1" />
          <line x1="287" y1="96" x2="287" y2="108" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Op-Amp Output */}
          <line x1="395" y1="100" x2="450" y2="100" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="415" cy="100" r="3" fill="#06b6d4" />

          {/* Test Point 3 */}
          <circle
            cx="440"
            cy="100"
            r="6"
            fill={activeTestPoint === 'TP3' ? '#10b981' : '#1e293b'}
            stroke="#10b981"
            strokeWidth="1.8"
            className="cursor-pointer hover:scale-125 transition-transform"
            onClick={() => setActiveTestPoint('TP3')}
          />
          <text x="432" y="88" fill="#10b981" fontWeight="bold">TP3</text>

          {/* Load Resistor RL to Output */}
          <circle cx="450" cy="100" r="3" fill="#10b981" />
          <path d="M450 100 H480" stroke="#10b981" strokeWidth="1.8" />
          <text x="484" y="103" fill="#10b981" fontWeight="bold">Vout</text>

          {/* Oscilloscope Reticle Screen Overlay */}
          <rect
            x="390"
            y="135"
            width="115"
            height="70"
            rx="4"
            fill="#05141d"
            stroke="#0e7490"
            strokeWidth="1"
          />
          {/* Reticle grid lines */}
          <line x1="447" y1="135" x2="447" y2="205" stroke="#155e75" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="390" y1="170" x2="505" y2="170" stroke="#155e75" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Simulated Animated AC Sine Wave */}
          <path
            d="M392 170 Q 406 142, 420 170 T 448 170 T 476 170 T 503 170"
            stroke="#22d3ee"
            strokeWidth="1.8"
            fill="none"
            className="animate-pulse"
          />
          <text x="395" y="146" fill="#22d3ee" fontSize="7.5">CH1: 2.0V/DIV</text>
          <text x="395" y="201" fill="#67e8f9" fontSize="7.5">1.000 kHz SINE</text>
        </svg>
      </div>

      {/* Selected Test Point Live Diagnostics Banner */}
      {activeTestPoint && testPoints[activeTestPoint] && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200">
                  {testPoints[activeTestPoint].label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  {testPoints[activeTestPoint].voltage}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{testPoints[activeTestPoint].note}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {['TP1', 'TP2', 'TP3'].map((tp) => (
              <button
                key={tp}
                onClick={() => setActiveTestPoint(tp)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-all ${
                  activeTestPoint === tp
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

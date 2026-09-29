'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth/context';
import { circuitService } from '@/lib/services/circuitService';
import { MODULES_ANALOG } from '@/lib/seed/courseData';
import { HelpCircle, Plus, Edit2, Trash2, CheckCircle2, Search, Filter } from 'lucide-react';
import { Question } from '@/types';

export default function AdminQuestionsPage() {
  const { user } = useAuth();
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES_ANALOG[0].id);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
  });

  const loadQuestions = async (modId: string) => {
    const list = await circuitService.getQuestions(modId);
    setQuestions(list);
  };

  useEffect(() => {
    loadQuestions(selectedModuleId);
  }, [selectedModuleId]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div className="p-8 text-center text-rose-400">403 Forbidden. Admin privilege required.</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: Question = {
      id: editingQuestion ? editingQuestion.id : `q-${selectedModuleId}-${Date.now()}`,
      module_id: selectedModuleId,
      question_text: form.question_text,
      option_a: form.option_a,
      option_b: form.option_b,
      option_c: form.option_c,
      option_d: form.option_d,
      correct_option: form.correct_option,
      explanation: form.explanation,
    };

    await circuitService.saveQuestion(newQ);
    await loadQuestions(selectedModuleId);
    setEditingQuestion(null);
    setIsAdding(false);
    setForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      explanation: '',
    });
    setMsg('Question successfully updated in question bank.');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsAdding(false);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation || '',
    });
  };

  const handleDelete = async (qId: string) => {
    if (confirm('Delete this question from examination pool?')) {
      await circuitService.deleteQuestion(selectedModuleId, qId);
      await loadQuestions(selectedModuleId);
      setMsg('Question deleted.');
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
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
                <HelpCircle className="w-4 h-4" />
                <span>ASSESSMENT ITEM REPOSITORY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Question Management</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Author, edit, and audit MCQ questions, distractors, keys, and technical explanations.
              </p>
            </div>

            <button
              onClick={() => {
                setIsAdding(true);
                setEditingQuestion(null);
                setForm({
                  question_text: '',
                  option_a: '',
                  option_b: '',
                  option_c: '',
                  option_d: '',
                  correct_option: 'A',
                  explanation: '',
                });
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Question</span>
            </button>
          </div>

          {msg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{msg}</span>
            </div>
          )}

          {/* Module Filter and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Filter by Module:
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {MODULES_ANALOG.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module {m.order_number}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-72">
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Search Question Text:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Keyword search..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Create or Edit Modal/Box */}
          {(isAdding || editingQuestion) && (
            <div className="p-6 rounded-2xl border border-amber-800/60 bg-slate-900/95 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">
                {editingQuestion ? 'Edit Question Item' : 'Add Question to Module'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Question Stem *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.question_text}
                    onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                    placeholder="Enter analytical question stem..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Option A *</label>
                    <input
                      type="text"
                      required
                      value={form.option_a}
                      onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Option B *</label>
                    <input
                      type="text"
                      required
                      value={form.option_b}
                      onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Option C *</label>
                    <input
                      type="text"
                      required
                      value={form.option_c}
                      onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Option D *</label>
                    <input
                      type="text"
                      required
                      value={form.option_d}
                      onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Correct Key Option *
                    </label>
                    <select
                      value={form.correct_option}
                      onChange={(e) => setForm({ ...form, correct_option: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Technical Explanation *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.explanation}
                      onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                      placeholder="Detailed physical rationale..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Save Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(null);
                      setIsAdding(false);
                    }}
                    className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{filteredQuestions.length} Questions in current selection</span>
            </div>

            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(q)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                      title="Edit Question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/40 text-rose-400 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const text =
                      optKey === 'A'
                        ? q.option_a
                        : optKey === 'B'
                        ? q.option_b
                        : optKey === 'C'
                        ? q.option_c
                        : q.option_d;
                    const isKey = q.correct_option === optKey;

                    return (
                      <div
                        key={optKey}
                        className={`p-2 rounded-lg border flex items-start gap-2 ${
                          isKey
                            ? 'border-emerald-600/80 bg-emerald-950/30 text-emerald-200'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400'
                        }`}
                      >
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            isKey ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {optKey}
                        </span>
                        <span className="flex-1">{text}</span>
                        {isKey && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <strong className="text-cyan-400 font-mono">Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

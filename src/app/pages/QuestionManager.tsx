import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Search, RotateCcw, BookOpen, X, ChevronDown, Filter } from 'lucide-react';
import { useQuiz, generateId } from '../store/quizStore';
import { NavSidebar } from '../components/NavSidebar';
import { AdminPageSkeleton } from '../components/Skeletons';
import { Question, Category, Difficulty } from '../store/types';

const CATEGORIES: Category[] = ['Quran', 'Hadith', 'Seerah', 'Aqeedah', 'Fiqh', 'General Knowledge'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const catColors: Record<string, { bg: string; text: string }> = {
  Quran:             { bg: '#dcfce7', text: '#166534' },
  Hadith:            { bg: '#dbeafe', text: '#1d4ed8' },
  Seerah:            { bg: '#f3e8ff', text: '#7e22ce' },
  Aqeedah:           { bg: '#fef9c3', text: '#92400e' },
  Fiqh:              { bg: '#fee2e2', text: '#991b1b' },
  'General Knowledge':{ bg: '#e0f2fe', text: '#075985' },
};
const diffColors: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: '#f0fdf4', text: '#166534' },
  Medium: { bg: '#fffbeb', text: '#92400e' },
  Hard:   { bg: '#fef2f2', text: '#991b1b' },
};

interface FormData { question: string; answer: string; category: Category; difficulty: Difficulty; }
const defaultForm: FormData = { question: '', answer: '', category: 'General Knowledge', difficulty: 'Medium' };

export default function QuestionManager() {
  const { state, dispatch } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'All'>('All');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const filtered = state.questions.filter(q => {
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || q.category === filterCat;
    const matchDiff = filterDiff === 'All' || q.difficulty === filterDiff;
    return matchSearch && matchCat && matchDiff;
  });

  function openAdd() { setEditId(null); setForm(defaultForm); setFormError(''); setShowForm(true); }
  function openEdit(q: Question) { setEditId(q.id); setForm({ question: q.question, answer: q.answer, category: q.category, difficulty: q.difficulty }); setFormError(''); setShowForm(true); }

  function handleSave() {
    if (!form.question.trim()) { setFormError('Question text is required'); return; }
    if (!form.answer.trim()) { setFormError('Answer is required'); return; }
    if (editId) {
      dispatch({ type: 'UPDATE_QUESTION', payload: { id: editId, ...form, used: false } });
    } else {
      const dup = state.questions.some(q => q.question.toLowerCase().trim() === form.question.toLowerCase().trim());
      if (dup) { setFormError('This question already exists'); return; }
      dispatch({ type: 'ADD_QUESTION', payload: { id: generateId(), ...form, used: false } });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this question?')) dispatch({ type: 'DELETE_QUESTION', payload: id });
  }

  const inputStyle = "w-full px-3 py-2.5 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const inputBorder = { border: '1px solid #d1d5db' };

  return (
    <NavSidebar>
      {loading ? (
        <AdminPageSkeleton rows={7} />
      ) : (
        <div className="min-h-full" style={{ background: '#f3f6f4' }}>
          {/* Page Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" style={{ color: '#0B5D3B' }} />
                  Question Bank
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {state.questions.length} total · {state.questions.filter(q => !q.used).length} unused
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch({ type: 'RESET_ALL_USED' })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #e5e7eb', color: '#374151' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Used
                </button>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: '#0B5D3B' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex gap-3 mb-5">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white flex-1"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="bg-transparent text-sm text-gray-800 outline-none flex-1 placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                )}
              </div>
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value as Category | 'All')}
                className="px-3 py-2 rounded-lg text-sm text-gray-700 bg-white outline-none"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filterDiff}
                onChange={e => setFilterDiff(e.target.value as Difficulty | 'All')}
                className="px-3 py-2 rounded-lg text-sm text-gray-700 bg-white outline-none"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <option value="All">All Difficulties</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Category chips */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {['All', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat as Category | 'All')}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: filterCat === cat ? '#0B5D3B' : '#f3f4f6',
                    color: filterCat === cat ? '#ffffff' : '#374151',
                  }}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-1 opacity-60">
                      ({state.questions.filter(q => q.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Table header */}
              <div
                className="grid grid-cols-12 gap-0 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ background: '#f9fafb', borderBottom: '1px solid #f0f4f1' }}
              >
                <span className="col-span-1">#</span>
                <span className="col-span-5">Question</span>
                <span className="col-span-3">Answer</span>
                <span className="col-span-1">Cat.</span>
                <span className="col-span-1">Diff.</span>
                <span className="col-span-1 text-right">Edit</span>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="font-semibold text-gray-700">
                    {state.questions.length === 0 ? 'No questions yet' : 'No results found'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {state.questions.length === 0 ? 'Add or import questions to get started' : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className="grid grid-cols-12 gap-0 px-5 py-3.5 items-center group hover:bg-gray-50 transition-colors"
                    >
                      <span className="col-span-1 text-xs font-bold text-gray-300">{i + 1}</span>
                      <div className="col-span-5 pr-3">
                        <p className="text-sm text-gray-800 font-medium line-clamp-2">{q.question}</p>
                        {q.used && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block" style={{ background: '#fef2f2', color: '#dc2626' }}>used</span>
                        )}
                      </div>
                      <div className="col-span-3 pr-3">
                        <p className="text-sm text-gray-500 truncate">{q.answer}</p>
                      </div>
                      <div className="col-span-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-semibold truncate block"
                          style={catColors[q.category] ? { background: catColors[q.category].bg, color: catColors[q.category].text } : {}}
                        >
                          {q.category.split(' ')[0]}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={diffColors[q.difficulty] ? { background: diffColors[q.difficulty].bg, color: diffColors[q.difficulty].text } : {}}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(q)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          style={{ color: '#3b82f6' }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filtered.length > 0 && (
                <div className="px-5 py-3 text-xs text-gray-400" style={{ borderTop: '1px solid #f0f4f1', background: '#f9fafb' }}>
                  Showing {filtered.length} of {state.questions.length} questions
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f4f1' }}>
                <h3 className="font-bold text-gray-900">{editId ? 'Edit Question' : 'Add New Question'}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Question *</label>
                  <textarea
                    value={form.question}
                    onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                    rows={3}
                    placeholder="Enter the question..."
                    className={inputStyle}
                    style={{ ...inputBorder, resize: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Answer *</label>
                  <input
                    value={form.answer}
                    onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                    placeholder="Enter the answer..."
                    className={inputStyle}
                    style={inputBorder}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                      className={inputStyle}
                      style={inputBorder}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Difficulty }))}
                      className={inputStyle}
                      style={inputBorder}
                    >
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                {formError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" />{formError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #f0f4f1', background: '#f9fafb' }}>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#0B5D3B' }}
                >
                  {editId ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NavSidebar>
  );
}
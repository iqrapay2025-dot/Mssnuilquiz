import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Users, Clock, Star, BookOpen, ChevronLeft, Play, Eye, EyeOff, AlertCircle, Trash2 } from 'lucide-react';
import { useQuiz, generateId } from '../store/quizStore';
import { SessionType, Category } from '../store/types';
import { SetupSkeleton } from '../components/Skeletons';
import mssnLogo from '../../../src/imports/mssn_logo-removebg-preview__3_.png';

export default function SetupScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [loading, setLoading] = useState(true);

  const [facultyName, setFacultyName] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('Male');
  const [members, setMembers] = useState(['', '']);
  const [numQuestions, setNumQuestions] = useState(15);
  const [totalTime, setTotalTime] = useState(300);
  const [pointsPerQ, setPointsPerQ] = useState(10);
  const [enableMultipliers, setEnableMultipliers] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const totalQs = state.questions.length;
  const availableQs = state.questions.filter(q => !q.used).length;
  const existingFaculty = state.faculties.find(f => f.name.toLowerCase() === facultyName.toLowerCase());

  function handleStart() {
    setError('');
    if (!facultyName.trim()) { setError('Please enter a faculty name.'); return; }
    if (totalQs === 0) { setError('No questions in the bank. Please import questions first.'); return; }
    if (totalQs < numQuestions) { setError(`Only ${totalQs} questions available. Reduce question count to ${totalQs} or less.`); return; }

    const facultyId = existingFaculty?.id || generateId();
    dispatch({
      type: 'START_SESSION',
      payload: {
        facultyId,
        facultyName: facultyName.trim(),
        sessionType,
        teamMembers: members.filter(Boolean),
        numQuestions,
        totalTime,
        pointsPerQuestion: pointsPerQ,
        enableMultipliers,
      },
    });
    navigate('/ready');
  }

  function handleDeleteAllQuestions() {
    if (totalQs === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete all ${totalQs} questions? This action cannot be undone.`
    );
    if (confirmDelete) {
      dispatch({ type: 'CLEAR_ALL_QUESTIONS' });
      setError('');
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white";
  const inputStyle = { border: '1px solid #d1d5db' };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <SetupSkeleton />;

  return (
    <div className="min-h-screen" style={{ background: '#f3f6f4' }}>
      {/* Sticky glassmorphism top bar */}
      <header
        className="sticky top-0 z-50 px-6 py-3.5 flex items-center gap-4 transition-all"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(229,235,231,0.7)',
          boxShadow: '0 2px 16px rgba(11,93,59,0.06)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: '#6b7280' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {/* Logo */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#ffff', padding: 2 }}
        >
          <img
            src={mssnLogo}
            alt="MSSN Logo"
            style={{
              width: 30,
              height: 30,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.9))',
            }}
          />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Competition Setup</h1>
          <p className="text-xs text-gray-400">Configure your quiz session</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Question bank status */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 justify-between"
          style={{
            background: totalQs === 0 ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${totalQs === 0 ? '#fecaca' : '#bbf7d0'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: totalQs === 0 ? '#dc2626' : '#16a34a' }} />
            <p className="text-sm" style={{ color: totalQs === 0 ? '#dc2626' : '#166534' }}>
              <span className="font-bold">{totalQs}</span> questions total ·{' '}
              <span className="font-bold">{availableQs}</span> unused
              {totalQs === 0 && (
                <button onClick={() => navigate('/import')} className="ml-2 underline font-semibold">
                  Import questions →
                </button>
              )}
            </p>
          </div>
          {totalQs > 0 && (
            <button
              onClick={handleDeleteAllQuestions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All
            </button>
          )}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5ebe7' }}>
          <div className="px-6 py-5" style={{ borderBottom: '1px solid #f0f4f1' }}>
            <h2 className="font-bold text-gray-900">Session Details</h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Faculty Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Faculty Name *</label>
              <input
                value={facultyName}
                onChange={e => setFacultyName(e.target.value)}
                placeholder="e.g. Faculty of Engineering"
                list="faculties-list"
                className={inputClass}
                style={inputStyle}
              />
              <datalist id="faculties-list">
                {state.faculties.map(f => <option key={f.id} value={f.name} />)}
              </datalist>
              {existingFaculty && (
                <p className="text-xs mt-1 font-medium" style={{ color: '#16a34a' }}>
                  ✓ Existing faculty — scores will be accumulated
                </p>
              )}
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Session Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Male', 'Female'] as SessionType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    className="py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: sessionType === type
                        ? (type === 'Male' ? '#eff6ff' : '#fdf2f8')
                        : '#f9fafb',
                      border: sessionType === type
                        ? (type === 'Male' ? '2px solid #3b82f6' : '2px solid #ec4899')
                        : '2px solid #e5e7eb',
                      color: sessionType === type
                        ? (type === 'Male' ? '#1d4ed8' : '#be185d')
                        : '#6b7280',
                    }}
                  >
                    {type === 'Male' ? '♂ Male Session' : '♀ Female Session'}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Team Members (2 participants)
              </label>
              <div className="space-y-2">
                {[0, 1].map(i => (
                  <input
                    key={i}
                    value={members[i]}
                    onChange={e => {
                      const m = [...members];
                      m[i] = e.target.value;
                      setMembers(m);
                    }}
                    placeholder={`Participant ${i + 1} name`}
                    className={inputClass}
                    style={inputStyle}
                  />
                ))}
              </div>
            </div>

            {/* Numeric settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Questions</label>
                <input
                  type="number"
                  value={numQuestions}
                  min={1}
                  max={Math.min(50, totalQs)}
                  onChange={e => setNumQuestions(+e.target.value)}
                  className={inputClass + ' text-center font-bold'}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Time (sec)</label>
                <input
                  type="number"
                  value={totalTime}
                  min={60}
                  max={3600}
                  step={30}
                  onChange={e => setTotalTime(+e.target.value)}
                  className={inputClass + ' text-center font-bold'}
                  style={inputStyle}
                />
                <p className="text-xs text-gray-400 mt-1 text-center">{Math.floor(totalTime / 60)}m {totalTime % 60}s</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pts / Question</label>
                <input
                  type="number"
                  value={pointsPerQ}
                  min={5}
                  max={100}
                  step={5}
                  onChange={e => setPointsPerQ(+e.target.value)}
                  className={inputClass + ' text-center font-bold'}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Multipliers toggle */}
            <div
              className="flex items-center justify-between px-4 py-3.5 rounded-xl"
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">Fast Answer Multipliers</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  0–2s = ×2 · 3–5s = ×1.5 · 6s+ = ×1
                </p>
              </div>
              <button
                onClick={() => setEnableMultipliers(!enableMultipliers)}
                className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: enableMultipliers ? '#0B5D3B' : '#d1d5db' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: enableMultipliers ? '24px' : '4px' }}
                />
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: '#f9fafb', borderTop: '1px solid #f0f4f1' }}
          >
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Preview Questions'}
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #0B5D3B, #157A49)',
                boxShadow: '0 4px 12px rgba(11,93,59,0.3)',
              }}
            >
              <Play className="w-4 h-4" />
              Start Session
            </button>
          </div>
        </div>

        {/* Question Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ border: '1px solid #e5ebe7' }}
          >
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f1' }}>
              <h3 className="font-semibold text-sm text-gray-800">Question Bank</h3>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#dcfce7', color: '#166534' }}
              >
                {state.questions.length} total
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {state.questions.slice(0, 25).map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{q.question}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">→ {q.answer}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
                      {q.category}
                    </span>
                    {q.used && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#fef2f2', color: '#dc2626' }}>
                        used
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {state.questions.length > 25 && (
                <p className="text-center text-xs text-gray-400 py-3">
                  +{state.questions.length - 25} more questions
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
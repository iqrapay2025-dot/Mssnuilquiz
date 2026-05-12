import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ChevronDown, ChevronUp, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuiz } from '../store/quizStore';
import { NavSidebar } from '../components/NavSidebar';
import { AdminPageSkeleton } from '../components/Skeletons';
import { SessionLog } from '../store/types';

export default function SessionLogs() {
  const { state, dispatch } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const logs = [...state.sessionLogs].reverse();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return (
    <NavSidebar>
      {loading ? (
        <AdminPageSkeleton rows={5} />
      ) : (
        <div className="min-h-full" style={{ background: '#f3f6f4' }}>
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className="font-bold text-sm md:text-base text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 md:w-5 h-4 md:h-5" style={{ color: '#0B5D3B' }} />
                  Session Logs
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {logs.length} session{logs.length !== 1 ? 's' : ''} recorded
                </p>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={() => { if (window.confirm('Clear all session logs?')) dispatch({ type: 'CLEAR_LOGS' }); }}
                  className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors hover:bg-red-50 flex-shrink-0"
                  style={{ border: '1px solid #fecaca', color: '#dc2626' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl text-center py-20" style={{ border: '1px solid #e5ebe7' }}>
                <div className="text-4xl mb-3">📋</div>
                <p className="font-bold text-gray-700">No sessions recorded yet</p>
                <p className="text-sm text-gray-400 mt-1">Complete a session to see logs here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <SessionLogCard
                    key={log.id}
                    log={log}
                    index={i}
                    isExpanded={expanded === log.id}
                    onToggle={() => setExpanded(expanded === log.id ? null : log.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </NavSidebar>
  );
}

function SessionLogCard({
  log, index, isExpanded, onToggle, formatDate
}: {
  log: SessionLog;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  formatDate: (d: string) => { date: string; time: string };
}) {
  const { date, time } = formatDate(log.date);
  const correct = log.answers.filter(a => a.correct).length;
  const wrong = log.answers.filter(a => !a.correct).length;
  const accuracy = log.answers.length > 0 ? Math.round((correct / log.answers.length) * 100) : 0;
  const typeColor = log.sessionType === 'Male' ? '#1d4ed8' : '#be185d';
  const typeBg = log.sessionType === 'Male' ? '#eff6ff' : '#fdf2f8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl md:rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Row header */}
      <button
        onClick={onToggle}
        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-3 md:px-5 py-3 md:py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Top row: Index + Faculty info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Index */}
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#f3f4f6', color: '#6b7280' }}
          >
            {index + 1}
          </div>

          {/* Faculty */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-semibold text-xs md:text-sm text-gray-900 truncate">{log.facultyName}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                style={{ background: typeBg, color: typeColor }}
              >
                {log.sessionType}
              </span>
            </div>
            <p className="text-xs text-gray-400">{date} · {time}</p>
          </div>
        </div>

        {/* Stats row - responsive layout */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto flex-shrink-0">
          {/* Score - always visible */}
          <div className="text-center">
            <p className="text-lg md:text-xl font-black" style={{ color: '#0B5D3B' }}>{log.score}</p>
            <p className="text-xs text-gray-400">pts</p>
          </div>
          
          {/* Answered - hidden on mobile */}
          <div className="hidden sm:block text-center">
            <p className="text-sm font-bold text-gray-700">{log.answers.length}/{log.totalQuestions}</p>
            <p className="text-xs text-gray-400">answered</p>
          </div>
          
          {/* Accuracy - always visible */}
          <div className="text-center">
            <p className="text-sm md:text-base font-bold" style={{ color: accuracy >= 70 ? '#16a34a' : accuracy >= 40 ? '#d97706' : '#dc2626' }}>
              {accuracy}%
            </p>
            <p className="text-xs text-gray-400">accuracy</p>
          </div>
          
          {/* Correct/Wrong - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#16a34a' }}>
              <CheckCircle className="w-3.5 h-3.5" />{correct}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#dc2626' }}>
              <XCircle className="w-3.5 h-3.5" />{wrong}
            </span>
          </div>
          
          {/* Chevron */}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-3 md:px-5 pb-3 md:pb-4 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
              {/* Config chips */}
              <div className="flex gap-2 flex-wrap mb-3 md:mb-4">
                <span className="text-xs px-2 md:px-2.5 py-1 rounded-full font-medium" style={{ background: '#f3f4f6', color: '#374151' }}>
                  {log.config.numQuestions}q
                </span>
                <span className="text-xs px-2 md:px-2.5 py-1 rounded-full font-medium" style={{ background: '#f3f4f6', color: '#374151' }}>
                  {log.config.pointsPerQuestion}pts
                </span>
                <span className="text-xs px-2 md:px-2.5 py-1 rounded-full font-medium" style={{ background: '#f3f4f6', color: '#374151' }}>
                  {log.config.enableMultipliers ? '2× On' : '2× Off'}
                </span>
                {log.config.teamMembers.length > 0 && (
                  <span className="text-xs px-2 md:px-2.5 py-1 rounded-full font-medium" style={{ background: '#f3f4f6', color: '#374151' }}>
                    {log.config.teamMembers.join(' ')}
                  </span>
                )}
              </div>

              {/* Question breakdown */}
              {log.answers.length > 0 ? (
                <div className="space-y-1">
                  {log.answers.map((ans, j) => (
                    <div
                      key={`${ans.questionId}-${j}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm"
                      style={{
                        background: ans.correct ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${ans.correct ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: ans.correct ? '#dcfce7' : '#fee2e2' }}
                        >
                          {ans.correct
                            ? <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" style={{ color: '#16a34a' }} />
                            : <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3" style={{ color: '#dc2626' }} />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{ans.questionText}</p>
                          <p className="text-xs text-gray-400 truncate">→ {ans.answerText}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap sm:flex-nowrap text-xs">
                        <span className="flex items-center gap-0.5 text-gray-400 flex-shrink-0">
                          <Clock className="w-3 h-3" />{ans.timeTaken}s
                        </span>
                        {ans.multiplier > 1 && (
                          <span className="font-bold" style={{ color: '#d97706' }}>×{ans.multiplier}</span>
                        )}
                        <span className="font-bold flex-shrink-0" style={{ color: ans.correct ? '#16a34a' : '#dc2626' }}>
                          +{ans.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">No answers recorded</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
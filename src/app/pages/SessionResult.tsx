import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Trophy, RotateCcw, BarChart2, ChevronRight, Clock, Zap, Users } from 'lucide-react';
import { useQuiz } from '../store/quizStore';
import { IslamicBackground } from '../components/IslamicBackground';
import { DarkPageSkeleton } from '../components/Skeletons';
import mssnLogo from '../../imports/mssn_logo-removebg-preview__3_.png';

export default function SessionResult() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <DarkPageSkeleton />;

  const log = state.sessionLogs[state.sessionLogs.length - 1];
  const session = state.currentSession;

  const score = log?.score ?? session?.score ?? 0;
  const totalQ = log?.totalQuestions ?? session?.questions.length ?? 0;
  const answers = log?.answers ?? session?.answers ?? [];
  const facultyName = log?.facultyName ?? session?.config.facultyName ?? 'Faculty';
  const sessionType = log?.sessionType ?? session?.config.sessionType ?? 'Male';
  const config = log?.config ?? session?.config;

  const correct = answers.filter(a => a.correct).length;
  const wrong = answers.filter(a => !a.correct).length;
  const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
  const maxScore = totalQ * (config?.pointsPerQuestion ?? 10) * 2;
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const typeColor = sessionType === 'Male' ? '#1d4ed8' : '#be185d';
  const typeBg = sessionType === 'Male' ? '#eff6ff' : '#fdf2f8';

  // Cumulative faculty totals
  const facultyId = log?.config?.facultyId ?? session?.config.facultyId;
  const faculty = state.faculties.find(f => f.id === facultyId);
  const maleScore = faculty?.maleScore ?? 0;
  const femaleScore = faculty?.femaleScore ?? 0;
  const combinedTotal = maleScore + femaleScore;
  const hasBothSessions = maleScore > 0 && femaleScore > 0;
  const otherGender = sessionType === 'Male' ? 'Female' : 'Male';
  const otherScore = sessionType === 'Male' ? femaleScore : maleScore;

  function handleNewSession() {
    dispatch({ type: 'RESET_SESSION' });
    navigate('/setup');
  }

  return (
    <div
      className="min-h-screen relative overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #081C15 100%)' }}
    >
      <IslamicBackground opacity={0.07} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(200,169,81,0.15)', border: '1px solid rgba(200,169,81,0.3)' }}
          >
            <Trophy className="w-8 h-8" style={{ color: '#C8A951' }} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Session Complete!</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: typeBg, color: typeColor }}>
              {sessionType} Session
            </span>
            <span className="text-white font-semibold">{facultyName}</span>
          </div>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-8 text-center mb-5 relative overflow-hidden"
          style={{ background: 'rgba(11,93,59,0.2)', border: '1px solid rgba(11,93,59,0.35)' }}
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(11,93,59,0.3) 0%, transparent 60%)' }} />
          <p className="text-xs font-bold tracking-widest uppercase mb-2 relative z-10" style={{ color: 'rgba(255,255,255,0.4)' }}>Final Score</p>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.25 }}
            className="text-8xl font-black relative z-10"
            style={{ color: '#C8A951', textShadow: '0 0 30px rgba(200,169,81,0.4)' }}
          >
            {score}
          </motion.p>
          <p className="text-sm relative z-10 mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>out of {maxScore} possible</p>
          <div className="mt-4 w-full h-2 rounded-full overflow-hidden relative z-10" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #0B5D3B, #C8A951)' }}
            />
          </div>
          <p className="text-xs mt-1.5 relative z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}% efficiency</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          {[
            { label: 'Correct', value: correct, color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)', icon: CheckCircle },
            { label: 'Wrong', value: wrong, color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: XCircle },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#C8A951', bg: 'rgba(200,169,81,0.1)', border: 'rgba(200,169,81,0.2)', icon: Zap },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="px-4 py-4 rounded-2xl text-center" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Faculty Cumulative Total */}
        {faculty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-2xl p-5 mb-5"
            style={{
              background: hasBothSessions ? 'rgba(200,169,81,0.1)' : 'rgba(255,255,255,0.04)',
              border: hasBothSessions ? '1px solid rgba(200,169,81,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: hasBothSessions ? '#C8A951' : 'rgba(255,255,255,0.4)' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: hasBothSessions ? '#C8A951' : 'rgba(255,255,255,0.4)' }}>
                {facultyName} — Combined Standing
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              {/* Male score */}
              <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>♂ Male</p>
                <p className="text-2xl font-black" style={{ color: '#60a5fa' }}>{maleScore}</p>
                {sessionType === 'Male' && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(96,165,250,0.6)' }}>just scored</p>
                )}
              </div>

              {/* Plus */}
              <div className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>+</div>

              {/* Female score */}
              <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>♀ Female</p>
                <p className="text-2xl font-black" style={{ color: '#f472b6' }}>{femaleScore}</p>
                {sessionType === 'Female' && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(244,114,182,0.6)' }}>just scored</p>
                )}
              </div>

              {/* Equals */}
              <div className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>=</div>

              {/* Total */}
              <div
                className="flex-1 rounded-xl p-3 text-center"
                style={{
                  background: hasBothSessions ? 'rgba(200,169,81,0.15)' : 'rgba(255,255,255,0.04)',
                  border: hasBothSessions ? '1px solid rgba(200,169,81,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Total</p>
                <p className="text-2xl font-black" style={{ color: hasBothSessions ? '#C8A951' : 'rgba(255,255,255,0.3)' }}>
                  {combinedTotal}
                </p>
              </div>
            </div>

            {!hasBothSessions && (
              <p className="text-xs text-center mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                ⏳ Awaiting {otherGender} session to complete {facultyName}'s combined score
              </p>
            )}
            {hasBothSessions && (
              <p className="text-xs text-center mt-3 font-semibold" style={{ color: 'rgba(200,169,81,0.7)' }}>
                ✓ Both sessions complete — combined score is final
              </p>
            )}
          </motion.div>
        )}

        {/* Answers breakdown */}
        {answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden mb-5"
            style={{ border: '1px solid rgba(11,93,59,0.2)' }}
          >
            <div className="px-5 py-3.5" style={{ background: 'rgba(11,93,59,0.2)', borderBottom: '1px solid rgba(11,93,59,0.15)' }}>
              <h3 className="text-sm font-bold text-white">Question Breakdown</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {answers.map((ans, i) => (
                <motion.div
                  key={ans.questionId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: ans.correct ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)',
                      color: ans.correct ? '#4ade80' : '#f87171',
                    }}
                  >
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{ans.questionText}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>→ {ans.answerText}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <span className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <Clock className="w-3 h-3" />{ans.timeTaken}s
                    </span>
                    {ans.multiplier > 1 && <span style={{ color: '#f59e0b' }}>×{ans.multiplier}</span>}
                    <span className="font-bold" style={{ color: ans.correct ? '#4ade80' : '#f87171' }}>+{ans.points}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0B5D3B, #157A49)', boxShadow: '0 0 20px rgba(11,93,59,0.4)' }}
          >
            <Trophy className="w-5 h-5" />
            View Leaderboard
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleNewSession}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: 'rgba(11,93,59,0.15)', border: '1px solid rgba(11,93,59,0.3)', color: 'rgba(255,255,255,0.8)' }}
            >
              <RotateCcw className="w-4 h-4" />
              New Session
            </button>
            <button
              onClick={() => navigate('/stats')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
            >
              <BarChart2 className="w-4 h-4" />
              Statistics
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
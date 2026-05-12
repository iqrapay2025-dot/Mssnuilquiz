import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, CheckCircle, XCircle, SkipForward, RotateCcw,
  Pause, Play, Square, Monitor, ChevronRight, Zap
} from 'lucide-react';
import { useQuiz, formatTime } from '../store/quizStore';
import { IslamicBackground } from '../components/IslamicBackground';
import { DarkPageSkeleton } from '../components/Skeletons';

export default function ModeratorDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [pageLoading, setPageLoading] = useState(true);
  const session = state.currentSession;
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  // Timer — runs only here
  useEffect(() => {
    if (!session?.timerRunning) return;
    const interval = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
    return () => clearInterval(interval);
  }, [session?.timerRunning, dispatch]);

  // Redirect if no session
  useEffect(() => {
    if (!session) navigate('/setup');
  }, [session]);

  // Navigate to results when completed (auto-end fires END_SESSION to save faculty scores)
  useEffect(() => {
    if (session?.status === 'completed') {
      dispatch({ type: 'END_SESSION' });
      setTimeout(() => navigate('/results'), 800);
    }
  }, [session?.status]);

  const handleReveal = useCallback(() => {
    if (session?.status !== 'active') return;
    dispatch({ type: 'REVEAL_ANSWER' });
    setLastAction('R – Reveal Answer');
  }, [session?.status, dispatch]);

  const handleCorrect = useCallback(() => {
    if (session?.status !== 'revealed') return;
    if (session.answers.length > session.currentIndex) return;
    dispatch({ type: 'MARK_ANSWER', payload: { correct: true } });
    setLastAction('C – Correct ✓');
  }, [session, dispatch]);

  const handleWrong = useCallback(() => {
    if (session?.status !== 'revealed') return;
    if (session.answers.length > session.currentIndex) return;
    dispatch({ type: 'MARK_ANSWER', payload: { correct: false } });
    setLastAction('W – Wrong ✗');
  }, [session, dispatch]);

  const handleNext = useCallback(() => {
    if (!session) return;
    const isAnswered = session.answers.length > session.currentIndex;
    if (!isAnswered && session.status !== 'timeup') return;
    dispatch({ type: 'NEXT_QUESTION' });
    setLastAction('N – Next Question');
  }, [session, dispatch]);

  const handleUndo = useCallback(() => {
    if (!session?.undoSnapshot) return;
    dispatch({ type: 'UNDO' });
    setLastAction('U – Undo');
  }, [session?.undoSnapshot, dispatch]);

  const handlePauseResume = useCallback(() => {
    if (!session) return;
    if (session.status === 'active') {
      dispatch({ type: 'PAUSE_SESSION' });
      setLastAction('Space – Paused');
    } else if (session.status === 'paused') {
      dispatch({ type: 'RESUME_SESSION' });
      setLastAction('Space – Resumed');
    }
  }, [session?.status, dispatch]);

  const handleEnd = () => {
    // Only dispatch END_SESSION if not already completed (auto-complete useEffect handles that case)
    if (session?.status !== 'completed') {
      dispatch({ type: 'END_SESSION' });
    }
    navigate('/results');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key.toLowerCase()) {
        case 'r': e.preventDefault(); handleReveal(); break;
        case 'c': e.preventDefault(); handleCorrect(); break;
        case 'w': e.preventDefault(); handleWrong(); break;
        case 'n': e.preventDefault(); handleNext(); break;
        case 'u': e.preventDefault(); handleUndo(); break;
        case ' ': e.preventDefault(); handlePauseResume(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleReveal, handleCorrect, handleWrong, handleNext, handleUndo, handlePauseResume]);

  if (!session) return null;

  if (pageLoading) return <DarkPageSkeleton />;

  const currentQ = session.questions[session.currentIndex];
  const isActive = session.status === 'active';
  const isRevealed = session.status === 'revealed';
  const isPaused = session.status === 'paused';
  const isTimeUp = session.status === 'timeup';
  const isCompleted = session.status === 'completed';
  const isAnswered = session.answers.length > session.currentIndex;
  const typeColor = session.config.sessionType === 'Male' ? '#3b82f6' : '#ec4899';
  const timePercent = (session.timeRemaining / session.config.totalTime) * 100;
  const timerColor = timePercent > 50 ? '#4ade80' : timePercent > 20 ? '#f59e0b' : '#ef4444';

  const multiplierPoints =
    session.currentMultiplier === 2 ? session.config.pointsPerQuestion * 2 :
    session.currentMultiplier === 1.5 ? session.config.pointsPerQuestion * 1.5 :
    session.config.pointsPerQuestion;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #081C15 100%)' }}
    >
      <IslamicBackground opacity={0.06} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: `${typeColor}22`, border: `1px solid ${typeColor}55`, color: typeColor }}
            >
              {session.config.sessionType} Session
            </div>
            <h1 className="text-lg font-black text-white">{session.config.facultyName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/quiz', '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(11,93,59,0.2)', border: '1px solid rgba(11,93,59,0.3)', color: 'rgba(255,255,255,0.6)' }}
            >
              <Monitor className="w-3.5 h-3.5" />
              Projector
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}
            >
              <Square className="w-3.5 h-3.5" />
              End Session
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Question Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {/* Timer */}
              <div
                className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(11,93,59,0.15)', border: '1px solid rgba(11,93,59,0.25)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>TIME</p>
                <p
                  className="text-3xl font-black tabular-nums"
                  style={{ color: timerColor, textShadow: `0 0 15px ${timerColor}55` }}
                >
                  {formatTime(session.timeRemaining)}
                </p>
                {isPaused && <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>PAUSED</p>}
                {isTimeUp && <p className="text-xs mt-0.5" style={{ color: '#ef4444' }}>TIME UP</p>}
              </div>
              {/* Score */}
              <div
                className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(11,93,59,0.15)', border: '1px solid rgba(11,93,59,0.25)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>SCORE</p>
                <motion.p
                  key={session.score}
                  animate={{ scale: [1.2, 1] }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-black"
                  style={{ color: '#C8A951' }}
                >
                  {session.score}
                </motion.p>
              </div>
              {/* Progress */}
              <div
                className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(11,93,59,0.15)', border: '1px solid rgba(11,93,59,0.25)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Q</p>
                <p className="text-3xl font-black text-white">
                  {session.currentIndex + 1}
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>/{session.questions.length}</span>
                </p>
              </div>
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={session.currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(11,93,59,0.12)', border: '1px solid rgba(11,93,59,0.25)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(11,93,59,0.3)', color: '#4ade80' }}>
                    {currentQ.category}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                    {currentQ.difficulty}
                  </span>
                </div>
                <p className="text-xl font-bold text-white leading-snug">{currentQ.question}</p>

                {/* Revealed answer */}
                <AnimatePresence>
                  {session.answerRevealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 overflow-hidden"
                      style={{ borderTop: '1px solid rgba(74,222,128,0.2)' }}
                    >
                      <p className="text-xs font-bold mb-1" style={{ color: 'rgba(74,222,128,0.6)' }}>ANSWER</p>
                      <p className="text-lg font-bold" style={{ color: '#4ade80' }}>{currentQ.answer}</p>
                      {session.currentMultiplier > 1 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Zap className="w-4 h-4" style={{ color: '#f59e0b' }} />
                          <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>
                            ×{session.currentMultiplier} multiplier → {Math.round(multiplierPoints)} pts
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Answer history */}
            {session.answers.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>ANSWER HISTORY</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {session.answers.slice().reverse().map((ans, i) => (
                    <div key={`${ans.questionId}-${i}`} className="flex items-center gap-2 text-sm">
                      <span className={ans.correct ? 'text-green-400' : 'text-red-400'}>
                        {ans.correct ? '✓' : '✗'}
                      </span>
                      <span className="text-white flex-1 truncate text-xs">{ans.questionText}</span>
                      <span className="font-bold text-xs" style={{ color: ans.correct ? '#4ade80' : '#f87171' }}>
                        +{ans.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="space-y-3">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Controls
            </p>

            {/* Reveal */}
            <ControlBtn
              onClick={handleReveal}
              disabled={!isActive || session.answerRevealed}
              label="Reveal Answer"
              shortcut="R"
              icon={<Eye className="w-4 h-4" />}
              color="#0B5D3B"
              glowColor="rgba(11,93,59,0.6)"
            />

            {/* Correct */}
            <ControlBtn
              onClick={handleCorrect}
              disabled={!isRevealed || isAnswered}
              label="Correct"
              shortcut="C"
              icon={<CheckCircle className="w-4 h-4" />}
              color="#166534"
              activeColor="#16a34a"
              glowColor="rgba(22,163,74,0.5)"
            />

            {/* Wrong */}
            <ControlBtn
              onClick={handleWrong}
              disabled={!isRevealed || isAnswered}
              label="Wrong"
              shortcut="W"
              icon={<XCircle className="w-4 h-4" />}
              color="#991b1b"
              activeColor="#dc2626"
              glowColor="rgba(220,38,38,0.5)"
            />

            {/* Next */}
            <ControlBtn
              onClick={handleNext}
              disabled={!isAnswered && !isTimeUp}
              label="Next Question"
              shortcut="N"
              icon={<SkipForward className="w-4 h-4" />}
              color="#1d4ed8"
              glowColor="rgba(29,78,216,0.5)"
            />

            {/* Undo */}
            <ControlBtn
              onClick={handleUndo}
              disabled={!session.undoSnapshot}
              label="Undo"
              shortcut="U"
              icon={<RotateCcw className="w-4 h-4" />}
              color="#92400e"
              glowColor="rgba(146,64,14,0.4)"
            />

            {/* Pause/Resume */}
            <ControlBtn
              onClick={handlePauseResume}
              disabled={!isActive && !isPaused}
              label={isPaused ? 'Resume' : 'Pause'}
              shortcut="Space"
              icon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              color="#6b21a8"
              glowColor="rgba(107,33,168,0.4)"
            />

            {/* Keyboard hints */}
            <div
              className="mt-4 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>SHORTCUTS</p>
              {[
                ['R', 'Reveal Answer'],
                ['C', 'Correct'],
                ['W', 'Wrong'],
                ['N', 'Next'],
                ['U', 'Undo'],
                ['Space', 'Pause/Resume'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between text-xs mb-1">
                  <span
                    className="font-mono px-1.5 py-0.5 rounded text-xs"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#C8A951', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {key}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Last action */}
            {lastAction && (
              <motion.p
                key={lastAction + Date.now()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs py-1.5 rounded-lg"
                style={{ background: 'rgba(11,93,59,0.2)', color: '#4ade80' }}
              >
                ↩ {lastAction}
              </motion.p>
            )}
          </div>
        </div>

        {/* TIME UP banner */}
        <AnimatePresence>
          {isTimeUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl flex items-center justify-between"
              style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)' }}
            >
              <p className="text-lg font-black" style={{ color: '#ef4444' }}>⏰ TIME UP! Controls locked.</p>
              <button
                onClick={() => setShowEndConfirm(true)}
                className="px-4 py-2 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(220,38,38,0.4)', color: '#fff', border: '1px solid rgba(220,38,38,0.6)' }}
              >
                End Session →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* End Session Confirm */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="rounded-2xl p-6 max-w-sm w-full mx-4"
              style={{ background: '#0d2b1d', border: '1px solid rgba(11,93,59,0.4)' }}
            >
              <h3 className="text-xl font-black text-white mb-2">End this session?</h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Final score of <strong className="text-white">{session.score} pts</strong> will be recorded for{' '}
                <strong className="text-white">{session.config.facultyName}</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnd}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white"
                  style={{ background: 'rgba(220,38,38,0.4)', border: '1px solid rgba(220,38,38,0.5)' }}
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ControlBtnProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  color: string;
  activeColor?: string;
  glowColor?: string;
}

function ControlBtn({ onClick, disabled, label, shortcut, icon, color, glowColor }: ControlBtnProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left"
      style={{
        background: disabled ? 'rgba(255,255,255,0.04)' : `${color}33`,
        border: disabled ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${color}66`,
        color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
        boxShadow: !disabled ? `0 0 15px ${glowColor || 'transparent'}` : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ opacity: disabled ? 0.4 : 1 }}>{icon}</span>
      <span className="flex-1">{label}</span>
      <span
        className="font-mono text-xs px-1.5 py-0.5 rounded"
        style={{
          background: 'rgba(255,255,255,0.06)',
          color: disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {shortcut}
      </span>
    </motion.button>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuiz, formatTime } from '../store/quizStore';
import { IslamicBackground } from '../components/IslamicBackground';
import { DarkPageSkeleton } from '../components/Skeletons';
import { QuizSession } from '../store/types';
import mssnLogo from '../../imports/mssn_logo-removebg-preview__3_.png';

function MultiplierBadge({ multiplier }: { multiplier: number }) {
  if (multiplier <= 1) return null;
  const label = multiplier === 2 ? '×2 ⚡ ULTRA FAST!' : '×1.5 ⚡ FAST!';
  const color = multiplier === 2 ? '#f59e0b' : '#84cc16';
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className="inline-block px-6 py-2 rounded-full text-xl font-black"
      style={{ background: `${color}22`, border: `2px solid ${color}`, color, boxShadow: `0 0 30px ${color}66` }}
    >
      {label}
    </motion.div>
  );
}

function ScoreFloat({ points, id }: { points: number; id: string }) {
  const colors: Record<number, string> = { 20: '#f59e0b', 15: '#84cc16', 10: '#4ade80' };
  const color = colors[points] || '#4ade80';
  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -100, scale: 1.5 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="absolute right-16 font-black text-5xl pointer-events-none select-none"
      style={{ color, textShadow: `0 0 20px ${color}`, top: '30%' }}
    >
      +{points}
    </motion.div>
  );
}

export default function ProjectorDisplay() {
  const { state } = useQuiz();
  const [pageLoading, setPageLoading] = useState(true);
  const [scoreFloats, setScoreFloats] = useState<{ id: string; points: number }[]>([]);
  const session = state.currentSession;
  const prevAnswersRef = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Show score float when a new correct answer is recorded
  useEffect(() => {
    if (!session) return;
    const currentLen = session.answers.length;
    if (currentLen > prevAnswersRef.current) {
      const lastAnswer = session.answers[currentLen - 1];
      if (lastAnswer?.correct && lastAnswer.points > 0) {
        const newFloat = { id: `${Date.now()}-${Math.random()}`, points: lastAnswer.points };
        setScoreFloats(prev => [...prev, newFloat]);
        setTimeout(() => {
          setScoreFloats(prev => prev.filter(f => f.id !== newFloat.id));
        }, 1600);
      }
    }
    prevAnswersRef.current = currentLen;
  }, [session?.answers.length]);

  if (pageLoading) return <DarkPageSkeleton />;
  if (!session) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#081C15' }}
      >
        <IslamicBackground opacity={0.15} />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 text-center"
        >
          <div className="text-6xl mb-6">🌙</div>
          <h1 className="text-4xl font-black text-white mb-3">MSSN Quiz Championship</h1>
          <p className="text-xl" style={{ color: 'rgba(255,255,255,0.45)' }}>Waiting for session to begin...</p>
          <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>Moderator will start the session shortly</p>
        </motion.div>
      </div>
    );
  }

  const currentQ = session.questions[session.currentIndex];
  const isTimeUp = session.status === 'timeup';
  const isCompleted = session.status === 'completed';
  const isRevealed = session.answerRevealed;
  const isPaused = session.status === 'paused';
  const typeColor = session.config.sessionType === 'Male' ? '#3b82f6' : '#ec4899';
  const timePercent = (session.timeRemaining / session.config.totalTime) * 100;
  const timerColor = timePercent > 50 ? '#4ade80' : timePercent > 20 ? '#f59e0b' : '#ef4444';

  return (
    <div
      className="min-h-screen relative flex flex-col overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #040E09 0%, #081C15 60%, #040E09 100%)' }}
    >
      <IslamicBackground opacity={0.08} />

      {/* Score floats */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {scoreFloats.map(f => <ScoreFloat key={f.id} id={f.id} points={f.points} />)}
        </AnimatePresence>
      </div>

      {/* TOP BAR */}
      <div
        className="relative z-10 flex items-center justify-between px-10 py-5"
        style={{
          background: 'rgba(8,28,21,0.8)',
          borderBottom: '1px solid rgba(11,93,59,0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Faculty */}
        <div className="flex items-center gap-4">
          <div
            className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: `${typeColor}22`, border: `1px solid ${typeColor}55`, color: typeColor }}
          >
            {session.config.sessionType} Session
          </div>
          <h2 className="text-2xl font-black text-white">{session.config.facultyName}</h2>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <div
            className="text-7xl font-black tabular-nums"
            style={{
              color: timerColor,
              textShadow: `0 0 30px ${timerColor}88`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatTime(session.timeRemaining)}
          </div>
          {/* Timer bar */}
          <div className="w-48 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: timerColor }}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            SCORE
          </p>
          <motion.div
            key={session.score}
            animate={{ scale: [1.15, 1] }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-black"
            style={{ color: '#C8A951', textShadow: '0 0 20px rgba(200,169,81,0.5)' }}
          >
            {session.score}
          </motion.div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-6 md:py-8">
        {/* Question counter */}
        <motion.div
          key={session.currentIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#C8A951' }}>
            Question {session.currentIndex + 1} of {session.questions.length}
          </span>
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(11,93,59,0.25)', border: '1px solid rgba(11,93,59,0.4)', color: '#4ade80' }}
          >
            {currentQ.category}
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
          >
            {currentQ.difficulty}
          </div>
        </motion.div>

        {/* Question text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${session.currentIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="text-center max-w-5xl mb-10"
          >
            <p
              className="font-black leading-tight text-white"
              style={{
                fontSize: currentQ.question.length > 120 ? '2.5rem' : currentQ.question.length > 80 ? '3rem' : '3.5rem',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              {currentQ.question}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer area */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center w-full max-w-4xl"
            >
              <div
                className="px-10 py-6 rounded-3xl relative overflow-hidden"
                style={{
                  background: 'rgba(11,93,59,0.25)',
                  border: '2px solid rgba(74,222,128,0.5)',
                  boxShadow: '0 0 60px rgba(11,93,59,0.5), inset 0 0 30px rgba(11,93,59,0.1)',
                }}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.15) 0%, transparent 70%)' }}
                />
                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(74,222,128,0.7)' }}>
                  Answer
                </p>
                <p
                  className="font-black text-white relative z-10"
                  style={{
                    fontSize: currentQ.answer.length > 80 ? '2rem' : currentQ.answer.length > 40 ? '2.5rem' : '3rem',
                    textShadow: '0 0 20px rgba(74,222,128,0.4)',
                  }}
                >
                  {currentQ.answer}
                </p>

                {/* Multiplier */}
                {session.currentMultiplier > 1 && (
                  <div className="mt-4">
                    <MultiplierBadge multiplier={session.currentMultiplier} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!isRevealed && !isTimeUp && !isCompleted && !isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-10 py-5 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <p className="text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Answer will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <div className="text-8xl font-black text-white mb-4">⏸</div>
              <p className="text-4xl font-black" style={{ color: '#C8A951' }}>PAUSED</p>
            </motion.div>
          </motion.div>
        )}

        {isRevealed && !isTimeUp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full flex items-center gap-2 z-20"
            style={{ background: 'rgba(11,93,59,0.3)', border: '1px solid rgba(11,93,59,0.5)' }}
          >
            <span className="text-lg">⏸</span>
            <span className="text-sm font-bold" style={{ color: '#4ade80' }}>TIMER PAUSED</span>
          </motion.div>
        )}

        {isTimeUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-9xl font-black mb-4"
                style={{ color: '#ef4444', textShadow: '0 0 60px rgba(239,68,68,0.8)' }}
              >
                ⏰
              </motion.div>
              <p className="text-7xl font-black" style={{ color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.6)' }}>
                TIME UP!
              </p>
              <p className="text-3xl font-bold mt-4 text-white">Final Score: {session.score}</p>
            </div>
          </motion.div>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          >
            <div className="text-center">
              <div className="text-8xl mb-4">🏆</div>
              <p className="text-6xl font-black text-white mb-3">Session Complete!</p>
              <p className="text-4xl font-bold" style={{ color: '#C8A951' }}>
                Final Score: {session.score}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom branding */}
      <div className="relative z-10 text-center pb-3">
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
          MSSN QUIZ CHAMPIONSHIP · JIHAD WEEK
        </p>
      </div>
    </div>
  );
}
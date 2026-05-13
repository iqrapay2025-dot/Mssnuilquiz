import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Settings, ExternalLink } from 'lucide-react';
import { useQuiz } from '../store/quizStore';
import { IslamicBackground } from '../components/IslamicBackground';
import { DarkPageSkeleton } from '../components/Skeletons';
import mssnLogo from '../../imports/mssn_logo-removebg-preview__3_.png';

export default function ReadyScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [pageLoading, setPageLoading] = useState(true);
  const session = state.currentSession;
  const [countdown, setCountdown] = useState<number | null>(3);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!session) { navigate('/setup'); return; }
  }, [session]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setLaunched(true);
      return;
    }
    const t = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function openProjector() {
    window.open('/quiz', '_blank', 'width=1280,height=720,toolbar=0,menubar=0');
  }

  function goToModerator() {
    dispatch({ type: 'RESUME_SESSION' });
    navigate('/moderator');
  }

  if (!session) return null;

  const typeColor = session.config.sessionType === 'Male' ? '#3b82f6' : '#ec4899';

  if (pageLoading) return <DarkPageSkeleton />;

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #081C15 100%)' }}
    >
      <IslamicBackground opacity={0.1} />

      {/* Pulsing glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${typeColor}33 0%, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Faculty + Session tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-3"
            style={{ background: `${typeColor}22`, border: `1px solid ${typeColor}66`, color: typeColor }}
          >
            {session.config.sessionType} Session
          </span>
          <h2 className="text-3xl font-black text-white">{session.config.facultyName}</h2>
          {session.config.teamMembers.length > 0 && (
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {session.config.teamMembers.join(' · ')}
            </p>
          )}
        </motion.div>

        {/* Countdown */}
        <AnimatePresence mode="wait">
          {countdown !== null ? (
            <motion.div key="countdown" className="my-8">
              <p className="text-sm font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Starting in
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-[120px] font-black leading-none"
                  style={{
                    color: '#C8A951',
                    textShadow: '0 0 40px rgba(200,169,81,0.6)',
                  }}
                >
                  {countdown}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="my-8"
            >
              <div
                className="text-5xl font-black text-white mb-2"
                style={{ textShadow: '0 0 30px rgba(11,93,59,0.8)' }}
              >
                🚀 Ready!
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Launch the competition screens below</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full mb-8"
        >
          {[
            { label: 'Questions', value: session.config.numQuestions },
            { label: 'Total Time', value: `${Math.floor(240 / 60)}m ${240 % 60}s` },
            { label: 'Pts/Question', value: session.config.pointsPerQuestion },
          ].map(item => (
            <div
              key={item.label}
              className="px-3 py-3 rounded-xl text-center"
              style={{ background: 'rgba(11,93,59,0.15)', border: '1px solid rgba(11,93,59,0.25)' }}
            >
              <p className="text-xl font-black text-white">{item.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Action buttons */}
        {launched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 w-full"
          >
            <button
              onClick={openProjector}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-white transition-all"
              style={{
                background: 'rgba(11,93,59,0.3)',
                border: '1px solid rgba(11,93,59,0.5)',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Open Projector Screen (New Window)
            </button>

            <button
              onClick={goToModerator}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #0B5D3B, #157A49)',
                boxShadow: '0 0 30px rgba(11,93,59,0.5)',
              }}
            >
              <Settings className="w-5 h-5" />
              Open Moderator Dashboard
            </button>

            <p className="text-xs text-center mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              💡 Tip: Open the Projector Screen first, then switch to Moderator Dashboard
            </p>
          </motion.div>
        )}

        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/setup')}
          className="mt-6 text-sm"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          ← Back to Setup
        </motion.button>
      </div>
    </div>
  );
}
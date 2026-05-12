import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import { useQuiz } from '../store/quizStore';
import { IslamicBackground } from '../components/IslamicBackground';
import { DarkPageSkeleton } from '../components/Skeletons';
import mssnLogo from '../../imports/mssn_logo-removebg-preview__3_.png';

export default function WinnerCeremony() {
  const navigate = useNavigate();
  const { state } = useQuiz();
  const [loading, setLoading] = useState(true);
  const hasLaunched = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const ranked = [...state.faculties]
    .map(f => ({ ...f, total: f.maleScore + f.femaleScore }))
    .sort((a, b) => b.total - a.total);

  const winner = ranked[0];

  // Confetti burst — only fires after loading skeleton is gone
  useEffect(() => {
    if (hasLaunched.current || !winner || loading) return;
    hasLaunched.current = true;

    const duration = 4000;
    const end = Date.now() + duration;

    const colors = ['#FFD700', '#0B5D3B', '#ffffff', '#C8A951', '#4ade80'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors,
      });
    }, 300);
  }, [winner, loading]);

  if (loading) return <DarkPageSkeleton />;

  if (!winner) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#081C15' }}
      >
        <div className="text-center">
          <p className="text-white text-xl">No winner yet — complete sessions first!</p>
          <button onClick={() => navigate('/leaderboard')} className="mt-4 text-green-400 underline">
            Go to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #0d1f15 50%, #081C15 100%)' }}
    >
      <IslamicBackground opacity={0.08} />

      {/* Spotlight effect */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(200,169,81,0.2) 0%, transparent 70%)',
            'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(200,169,81,0.3) 0%, transparent 70%)',
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(200,169,81,0.2) 0%, transparent 70%)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full">
        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-bold tracking-[0.3em] uppercase mb-4"
          style={{ color: '#C8A951' }}
        >
          🏆 MSSN Jihad Week Champion 🏆
        </motion.p>

        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
          className="mb-4"
        >
          <motion.div
            animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[100px] select-none"
          >
            🏆
          </motion.div>
        </motion.div>

        {/* Winner Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.5 }}
          className="mb-3"
        >
          <div
            className="px-8 py-6 rounded-3xl relative overflow-hidden"
            style={{
              background: 'rgba(200,169,81,0.15)',
              border: '2px solid rgba(200,169,81,0.5)',
              boxShadow: '0 0 80px rgba(200,169,81,0.4)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,169,81,0.3) 0%, transparent 60%)' }}
            />
            <p className="text-sm font-bold tracking-widest uppercase mb-2 relative z-10" style={{ color: 'rgba(200,169,81,0.7)' }}>
              Overall Winner
            </p>
            <h1
              className="text-5xl md:text-6xl font-black text-white relative z-10"
              style={{ textShadow: '0 0 30px rgba(200,169,81,0.5)' }}
            >
              {winner.name}
            </h1>
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl font-black mt-2 relative z-10"
              style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.6)' }}
            >
              {winner.total} pts
            </motion.p>
          </div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 mb-8"
        >
          <div
            className="px-5 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <p className="text-sm font-bold" style={{ color: '#60a5fa' }}>♂ Male</p>
            <p className="text-2xl font-black text-white">{winner.maleScore}</p>
          </div>
          <div
            className="px-5 py-3 rounded-2xl flex items-center text-2xl font-black"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            +
          </div>
          <div
            className="px-5 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}
          >
            <p className="text-sm font-bold" style={{ color: '#f472b6' }}>♀ Female</p>
            <p className="text-2xl font-black text-white">{winner.femaleScore}</p>
          </div>
        </motion.div>

        {/* Full Rankings */}
        {ranked.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="w-full rounded-2xl overflow-hidden mb-8"
            style={{ border: '1px solid rgba(11,93,59,0.3)' }}
          >
            <div
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(11,93,59,0.25)', color: 'rgba(255,255,255,0.45)' }}
            >
              Final Rankings
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(11,93,59,0.15)' }}>
              {ranked.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95 + i * 0.08 }}
                  className="flex items-center gap-4 px-5 py-3"
                  style={{ background: i === 0 ? 'rgba(200,169,81,0.08)' : 'rgba(11,93,59,0.04)' }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      background: i === 0 ? 'rgba(255,215,0,0.2)' : i === 1 ? 'rgba(192,192,192,0.15)' : i === 2 ? 'rgba(205,127,50,0.15)' : 'rgba(255,255,255,0.06)',
                      color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-bold text-white text-sm">{f.name}</span>
                  <span className="text-xs" style={{ color: '#60a5fa' }}>♂{f.maleScore}</span>
                  <span className="text-xs" style={{ color: '#f472b6' }}>♀{f.femaleScore}</span>
                  <span className="font-black" style={{ color: i === 0 ? '#FFD700' : '#C8A951' }}>{f.total}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex gap-3 w-full"
        >
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: 'rgba(11,93,59,0.2)', border: '1px solid rgba(11,93,59,0.3)', color: 'rgba(255,255,255,0.7)' }}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #0B5D3B, #157A49)', color: '#fff' }}
          >
            <RotateCcw className="w-4 h-4" />
            New Competition
          </button>
        </motion.div>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-6 text-xs italic"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          "Seek knowledge from the cradle to the grave." — Prophet Muhammad ﷺ
        </motion.p>
      </div>
    </div>
  );
}
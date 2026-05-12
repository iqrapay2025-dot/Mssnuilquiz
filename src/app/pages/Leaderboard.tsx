import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Trophy, Crown, Home, RotateCcw, Medal } from 'lucide-react';
import { useQuiz } from '../store/quizStore';
import { IslamicBackground } from '../components/IslamicBackground';
import { DarkPageSkeleton } from '../components/Skeletons';
import { ScrollReveal } from '../components/ScrollReveal';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { state } = useQuiz();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <DarkPageSkeleton />;

  const ranked = [...state.faculties]
    .map(f => ({ ...f, total: f.maleScore + f.femaleScore }))
    .sort((a, b) => b.total - a.total);

  const completedCount = ranked.filter(f => f.maleScore > 0 && f.femaleScore > 0).length;
  const totalFaculties = ranked.length;
  const allComplete = completedCount === totalFaculties && totalFaculties > 0;

  const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div
      className="min-h-screen relative overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #081C15 100%)' }}
    >
      <IslamicBackground opacity={0.08} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Header with logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-7 h-7" style={{ color: '#C8A951' }} />
            <h1 className="text-3xl font-black text-white">Leaderboard</h1>
            <Trophy className="w-7 h-7" style={{ color: '#C8A951' }} />
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Faculty Rankings — MSSN Jihad Week</p>
        </motion.div>

        {ranked.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">🏅</div>
            <p className="text-xl font-bold text-white mb-2">No scores yet</p>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Complete sessions to see rankings</p>
            <button
              onClick={() => navigate('/setup')}
              className="px-6 py-3 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0B5D3B, #157A49)' }}
            >
              Start Competition
            </button>
          </motion.div>
        ) : (
          <>
            {/* Podium */}
            {ranked.length >= 1 && (
              <div className="flex items-end justify-center gap-4 mb-10">
                {[ranked[1], ranked[0], ranked[2]].map((faculty, pos) => {
                  if (!faculty) return <div key={`empty-${pos}`} className="w-28" />;
                  const realRank = pos === 0 ? 1 : pos === 1 ? 0 : 2; // mapped rank index
                  const rank = pos === 1 ? 0 : pos === 0 ? 1 : 2;
                  const isFirst = rank === 0;
                  const medalColor = medals[rank];
                  const podiumHeightsPx = [160, 96, 56];
                  const widths = ['w-28', 'w-32', 'w-28'];
                  return (
                    <motion.div
                      key={faculty.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rank * 0.1 + 0.1 }}
                      className={`flex flex-col items-center ${widths[rank]}`}
                    >
                      {isFirst && (
                        <motion.div
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Crown className="w-7 h-7 mb-2 mx-auto" style={{ color: medalColor }} />
                        </motion.div>
                      )}
                      {!isFirst && <Medal className="w-5 h-5 mb-2 mx-auto" style={{ color: medalColor }} />}

                      {/* Card */}
                      <div
                        className="w-full px-3 py-4 rounded-t-2xl text-center"
                        style={{
                          background: isFirst ? 'rgba(200,169,81,0.15)' : 'rgba(255,255,255,0.05)',
                          border: isFirst ? '1px solid rgba(200,169,81,0.35)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: isFirst ? '0 0 30px rgba(200,169,81,0.2)' : 'none',
                        }}
                      >
                        <p className="text-xs font-bold text-white truncate mb-1">{faculty.name}</p>
                        <p className="text-2xl font-black" style={{ color: medalColor }}>{faculty.total}</p>
                        <div className="flex justify-center gap-2 mt-1">
                          <span className="text-xs" style={{ color: '#60a5fa' }}>♂{faculty.maleScore}</span>
                          <span className="text-xs" style={{ color: '#f472b6' }}>♀{faculty.femaleScore}</span>
                        </div>
                      </div>
                      {/* Base */}
                      <div
                        className="w-full flex items-center justify-center rounded-b-xl"
                        style={{
                          height: podiumHeightsPx[rank],
                          background: isFirst ? 'rgba(200,169,81,0.1)' : 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <span className="text-2xl font-black" style={{ color: medalColor }}>{rank + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Session completion banner */}
            {totalFaculties > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl px-5 py-3 mb-4 flex items-center justify-between"
                style={{
                  background: allComplete ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)',
                  border: allComplete ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{allComplete ? '✅' : '⏳'}</span>
                  <span className="text-xs font-semibold" style={{ color: allComplete ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                    {allComplete
                      ? 'All faculties have completed both sessions — results are final!'
                      : `${completedCount} of ${totalFaculties} faculties fully complete (♂ + ♀)`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ color: '#60a5fa', fontSize: 11 }}>♂</span>
                  <span style={{ color: '#f472b6', fontSize: 11 }}>♀</span>
                  <span className="text-xs font-black ml-1" style={{ color: allComplete ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                    {completedCount}/{totalFaculties}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Full table */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl overflow-hidden mb-6"
              style={{ border: '1px solid rgba(11,93,59,0.25)' }}
            >
              <div
                className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                style={{ background: 'rgba(11,93,59,0.25)', color: 'rgba(255,255,255,0.4)' }}
              >
                <span className="col-span-1">#</span>
                <span className="col-span-4">Faculty</span>
                <span className="col-span-1 text-center">Done</span>
                <span className="col-span-2 text-center">♂ Male</span>
                <span className="col-span-2 text-center">♀ Female</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              <div className="divide-y" style={{ borderColor: 'rgba(11,93,59,0.12)' }}>
                {ranked.map((faculty, i) => {
                  const hasMale = faculty.maleScore > 0;
                  const hasFemale = faculty.femaleScore > 0;
                  const isComplete = hasMale && hasFemale;
                  return (
                    <motion.div
                      key={faculty.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="grid grid-cols-12 px-5 py-4 items-center"
                      style={{ background: i === 0 ? 'rgba(200,169,81,0.06)' : 'rgba(11,93,59,0.04)' }}
                    >
                      <div className="col-span-1">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                          style={{
                            background: i < 3 ? `${medals[i]}22` : 'rgba(255,255,255,0.05)',
                            color: i < 3 ? medals[i] : 'rgba(255,255,255,0.3)',
                            border: `1px solid ${i < 3 ? medals[i] + '44' : 'rgba(255,255,255,0.06)'}`,
                            display: 'inline-flex',
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <div className="col-span-4">
                        <p className="font-bold text-white text-sm">{faculty.name}</p>
                      </div>
                      <div className="col-span-1 flex justify-center items-center">
                        {isComplete ? (
                          <span title="Both sessions done" style={{ color: '#4ade80', fontSize: 14 }}>✓</span>
                        ) : (
                          <div className="flex flex-col gap-0" title={`Pending: ${!hasMale ? 'Male' : 'Female'} session`}>
                            <span style={{ color: hasMale ? '#60a5fa' : 'rgba(255,255,255,0.18)', fontSize: 9, lineHeight: 1.3 }}>♂</span>
                            <span style={{ color: hasFemale ? '#f472b6' : 'rgba(255,255,255,0.18)', fontSize: 9, lineHeight: 1.3 }}>♀</span>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {hasMale ? (
                          <span className="font-bold text-sm" style={{ color: '#60a5fa' }}>{faculty.maleScore}</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: 'rgba(96,165,250,0.35)', background: 'rgba(96,165,250,0.07)', border: '1px dashed rgba(96,165,250,0.2)' }}>—</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {hasFemale ? (
                          <span className="font-bold text-sm" style={{ color: '#f472b6' }}>{faculty.femaleScore}</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: 'rgba(244,114,182,0.35)', background: 'rgba(244,114,182,0.07)', border: '1px dashed rgba(244,114,182,0.2)' }}>—</span>
                        )}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-black text-lg" style={{ color: isComplete ? (i === 0 ? '#FFD700' : '#C8A951') : 'rgba(255,255,255,0.25)' }}>
                          {faculty.total > 0 ? faculty.total : '—'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Declare Winner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <button
                onClick={() => navigate('/winner')}
                className="w-full py-4 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #9d4edd)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
              >
                <Crown className="w-6 h-6" />
                Declare Winner Ceremony
              </button>
            </motion.div>
          </>
        )}

        {/* Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(11,93,59,0.15)', border: '1px solid rgba(11,93,59,0.3)', color: 'rgba(255,255,255,0.7)' }}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(11,93,59,0.2)', border: '1px solid rgba(11,93,59,0.35)', color: 'rgba(255,255,255,0.8)' }}
          >
            <RotateCcw className="w-4 h-4" />
            New Session
          </button>
        </motion.div>
      </div>
    </div>
  );
}
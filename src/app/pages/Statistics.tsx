import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { BarChart2, Zap, Target, Award, BookOpen, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell, PieChart, Pie,
} from 'recharts';
import { useQuiz } from '../store/quizStore';
import { NavSidebar } from '../components/NavSidebar';
import { AdminPageSkeleton } from '../components/Skeletons';

const catColors: Record<string, string> = {
  Quran: '#16a34a', Hadith: '#2563eb', Seerah: '#9333ea',
  Aqeedah: '#d97706', Fiqh: '#dc2626', 'General Knowledge': '#0891b2',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl px-4 py-3 shadow-lg text-sm" style={{ border: '1px solid #e5e7eb' }}>
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-gray-600">{p.name}: <span className="font-bold" style={{ color: p.color }}>{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Statistics() {
  const { state } = useQuiz();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const logs = state.sessionLogs;
  const allAnswers = logs.flatMap(l => l.answers);

  const totalSessions = logs.length;
  const totalCorrect = allAnswers.filter(a => a.correct).length;
  const totalWrong = allAnswers.filter(a => !a.correct).length;
  const overallAccuracy = allAnswers.length > 0 ? Math.round((totalCorrect / allAnswers.length) * 100) : 0;
  const highestScore = logs.length > 0 ? Math.max(...logs.map(l => l.score)) : 0;
  const multiplierX2 = allAnswers.filter(a => a.multiplier === 2 && a.correct).length;

  const facultyData = [...state.faculties]
    .map(f => ({ name: f.name.length > 12 ? f.name.split(' ').slice(-1)[0] : f.name, male: f.maleScore, female: f.femaleScore, total: f.maleScore + f.femaleScore }))
    .sort((a, b) => b.total - a.total).slice(0, 8);

  const categoryStats: Record<string, { correct: number; total: number }> = {};
  allAnswers.forEach(a => {
    const q = state.questions.find(q => q.id === a.questionId);
    const cat = q?.category || 'General Knowledge';
    if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
    categoryStats[cat].total++;
    if (a.correct) categoryStats[cat].correct++;
  });
  const radarData = Object.entries(categoryStats).map(([cat, { correct, total }]) => ({
    subject: cat.split(' ')[0],
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
  }));

  const multiplierCounts = [
    { name: '×2 ⚡ Ultra Fast', value: allAnswers.filter(a => a.correct && a.multiplier === 2).length, color: '#f59e0b' },
    { name: '×1.5 Fast', value: allAnswers.filter(a => a.correct && a.multiplier === 1.5).length, color: '#84cc16' },
    { name: '×1 Normal', value: allAnswers.filter(a => a.correct && a.multiplier === 1).length, color: '#4ade80' },
  ].filter(d => d.value > 0);

  const trendData = logs.map((l, i) => ({
    session: `S${i + 1}`,
    score: l.score,
    label: l.facultyName.split(' ').slice(-1)[0],
  })).slice(-10);

  const StatCard = ({ label, value, sub, icon: Icon, color, bg }: any) => (
    <div className="bg-white rounded-xl px-5 py-4 flex items-center gap-4" style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}{sub ? ` · ${sub}` : ''}</p>
      </div>
    </div>
  );

  const ChartCard = ({ title, icon: Icon, children, delay = 0 }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <Icon className="w-4 h-4" style={{ color: '#0B5D3B' }} />
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );

  return (
    <NavSidebar>
      {loading ? (
        <AdminPageSkeleton rows={6} />
      ) : (
      <div className="min-h-full" style={{ background: '#f3f6f4' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div>
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" style={{ color: '#0B5D3B' }} />
              Statistics Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Competition performance analytics</p>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            <StatCard label="Sessions" value={totalSessions} icon={BookOpen} color="#0B5D3B" bg="#ebf5ef" />
            <StatCard label="Accuracy" value={`${overallAccuracy}%`} icon={Target} color="#16a34a" bg="#dcfce7" />
            <StatCard label="Best Score" value={highestScore} icon={Award} color="#d97706" bg="#fef9c3" />
            <StatCard label="Correct" value={totalCorrect} icon={CheckCircle} color="#16a34a" bg="#f0fdf4" />
            <StatCard label="Wrong" value={totalWrong} icon={XCircle} color="#dc2626" bg="#fef2f2" />
            <StatCard label="×2 Bonuses" value={multiplierX2} icon={Zap} color="#f59e0b" bg="#fffbeb" />
          </div>

          {logs.length === 0 ? (
            <div className="bg-white rounded-2xl text-center py-20" style={{ border: '1px solid #e5ebe7' }}>
              <div className="text-4xl mb-3">📊</div>
              <p className="font-bold text-gray-700">No data yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete sessions to see statistics</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Faculty bar chart */}
              {facultyData.length > 0 && (
                <ChartCard title="Faculty Performance" icon={TrendingUp} delay={0.05}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={facultyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="male" name="Male" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="female" name="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Score trend */}
                {trendData.length > 1 && (
                  <ChartCard title="Score Trend" icon={BarChart2} delay={0.1}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="session" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" name="Score" radius={[5, 5, 0, 0]}>
                          {trendData.map((_, i) => (
                            <Cell key={i} fill={`hsl(${140 + i * 18}, 55%, 40%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* Multiplier pie */}
                {multiplierCounts.length > 0 && (
                  <ChartCard title="Speed Multipliers" icon={Zap} delay={0.15}>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={multiplierCounts} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                            {multiplierCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2.5 flex-shrink-0">
                        {multiplierCounts.map(d => (
                          <div key={d.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                            <div>
                              <p className="text-xs font-semibold text-gray-700">{d.name}</p>
                              <p className="text-xs text-gray-400">{d.value} times</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ChartCard>
                )}
              </div>

              {/* Radar */}
              {radarData.length > 0 && (
                <ChartCard title="Category Accuracy (%)" icon={Target} delay={0.2}>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#f3f4f6" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#d1d5db', fontSize: 9 }} />
                      <Radar name="Accuracy" dataKey="accuracy" stroke="#0B5D3B" fill="#0B5D3B" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Correct vs Wrong per session */}
              <ChartCard title="Correct vs Wrong per Session" icon={BarChart2} delay={0.25}>
                <div className="space-y-2.5">
                  {logs.slice(-10).map((log, i) => {
                    const c = log.answers.filter(a => a.correct).length;
                    const w = log.answers.filter(a => !a.correct).length;
                    const total = log.answers.length || 1;
                    const pct = (c / total) * 100;
                    return (
                      <div key={log.id} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28 truncate flex-shrink-0">
                          {log.facultyName.split(' ').slice(-1)[0]} ({log.sessionType[0]})
                        </span>
                        <div className="flex-1 h-5 rounded-full overflow-hidden bg-red-100">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: '#16a34a' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 w-14 text-right flex-shrink-0">
                          {c}✓ {w}✗
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            </div>
          )}
        </div>
      </div>
      )}
    </NavSidebar>
  );
}
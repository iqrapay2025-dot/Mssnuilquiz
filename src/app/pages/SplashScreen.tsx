import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Play, BookOpen, Trophy, BarChart2, Upload,
  FileText, ArrowRight, Zap, Users, Clock,
} from 'lucide-react';
import { useQuiz } from '../store/quizStore';
import { ScrollReveal } from '../components/ScrollReveal';
import { SplashSkeleton } from '../components/Skeletons';
import mssnLogo from '../../imports/mssn_logo-removebg-preview__3_.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { state } = useQuiz();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const totalQ = state.questions.length;
  const unusedQ = state.questions.filter(q => !q.used).length;
  const totalFaculties = state.faculties.length;
  const totalSessions = state.sessionLogs.length;

  const quickLinks = [
    { label: 'Question Bank', icon: BookOpen, path: '/questions', count: totalQ, color: '#0B5D3B', bg: '#ebf5ef' },
    { label: 'Import Questions', icon: Upload, path: '/import', count: null, color: '#7c3aed', bg: '#f3f0ff' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', count: totalFaculties, color: '#c8a951', bg: '#fefce8' },
    { label: 'Session Logs', icon: FileText, path: '/logs', count: totalSessions, color: '#0891b2', bg: '#f0f9ff' },
    { label: 'Statistics', icon: BarChart2, path: '/stats', count: null, color: '#dc2626', bg: '#fef2f2' },
  ];

  if (loading) return <SplashSkeleton />;

  return (
    <div className="min-h-screen" style={{ background: '#f3f6f4' }}>
      {/* ── Sticky glassmorphism top nav ── */}
      <header
        className="sticky top-0 z-50 px-8 py-3.5 flex items-center justify-between transition-all"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(229,235,231,0.7)',
          boxShadow: '0 2px 16px rgba(11,93,59,0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo with white stroke */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0B5D3B, #157A49)',
              boxShadow: '0 2px 10px rgba(11,93,59,0.35)',
              padding: 3,
            }}
          >
            <img
              src={mssnLogo}
              alt="MSSN Logo"
              style={{
                width: 30,
                height: 30,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.95)) drop-shadow(0 0 5px rgba(255,255,255,0.6))',
              }}
            />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">MSSN Quiz Championship</p>
            <p className="text-xs text-gray-400">Jihad Week Interfaculty Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/questions')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Manage
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #0B5D3B, #157A49)' }}
          >
            <Play className="w-4 h-4" />
            Start Competition
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <ScrollReveal>
          <div
            className="bg-white rounded-2xl overflow-hidden mb-6 relative"
            style={{
              border: '1px solid #e5ebe7',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {/* Green decorative band */}
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #0B5D3B, #C8A951, #157A49)' }}
            />
            <div className="flex items-center justify-between px-8 py-8">
              <div className="flex-1">
                {/* Logo + brand row */}
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={mssnLogo}
                    alt="MSSN Logo"
                    style={{
                      width: 52,
                      height: 52,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 6px rgba(11,93,59,0.25))',
                    }}
                  />
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#ebf5ef', color: '#0B5D3B' }}
                  >
                    <Zap className="w-3 h-3" />
                    Live Quiz System — Ready to Go
                  </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight">
                  MSSN Quiz
                  <span style={{ color: '#0B5D3B' }}> Championship</span>
                </h1>
                <p className="text-gray-500 text-base mb-6 max-w-lg">
                  Host live Islamic knowledge competitions. Moderator-controlled, projector-friendly,
                  with real-time scoring and leaderboards.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/setup')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #0B5D3B, #157A49)',
                      boxShadow: '0 4px 12px rgba(11,93,59,0.3)',
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Start Competition
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/import')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
                    style={{ border: '1px solid #e5e7eb', color: '#374151', background: '#ffffff' }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Questions
                  </button>
                </div>
              </div>
              {/* Decorative card preview */}
              <div className="hidden lg:block ml-8 flex-shrink-0">
                <div
                  className="w-56 rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #081C15, #0d2b1d)',
                    border: '1px solid rgba(11,93,59,0.3)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={mssnLogo}
                      alt=""
                      style={{
                        width: 20,
                        height: 20,
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
                      }}
                    />
                    <div className="text-xs font-bold tracking-widest text-green-400 opacity-70">LIVE QUESTION</div>
                  </div>
                  <p className="text-white font-bold text-sm leading-snug mb-4">
                    "What is the meaning of the word 'Islam'?"
                  </p>
                  <div
                    className="px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{
                      background: 'rgba(74,222,128,0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(74,222,128,0.3)',
                    }}
                  >
                    Peace / Submission to Allah
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs">
                    <span className="text-green-400 font-bold">+20 pts ⚡</span>
                    <span className="text-gray-500">02:34 left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Questions', value: totalQ, sub: `${unusedQ} unused`, icon: BookOpen, color: '#0B5D3B' },
              { label: 'Faculties', value: totalFaculties, sub: 'registered', icon: Users, color: '#7c3aed' },
              { label: 'Sessions', value: totalSessions, sub: 'completed', icon: Clock, color: '#0891b2' },
              { label: 'Ready', value: unusedQ, sub: 'to play', icon: Zap, color: '#C8A951' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.color + '15' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-400">
                      {item.label} · {item.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Quick links grid */}
        <ScrollReveal delay={0.15}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Quick Access</h2>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {quickLinks.map(item => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white rounded-xl px-4 py-5 text-left transition-all flex flex-col items-start gap-3"
                  style={{ border: '1px solid #e5ebe7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: item.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    {item.count !== null && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.count} items</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Bottom tip */}
        {totalQ === 0 && (
          <ScrollReveal delay={0.2}>
            <div
              className="mt-6 px-5 py-4 rounded-xl flex items-center gap-4"
              style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#fef9c3' }}
              >
                <Upload className="w-4 h-4" style={{ color: '#d97706' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                  No questions yet
                </p>
                <p className="text-xs" style={{ color: '#b45309' }}>
                  Upload a CSV, Excel, Word, or PDF file to get started.
                </p>
              </div>
              <button
                onClick={() => navigate('/import')}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{ background: '#d97706' }}
              >
                Import Now →
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Quranic quote */}
        <ScrollReveal delay={0.25}>
          <div className="mt-8 text-center">
            <p className="text-xs italic text-gray-400">
              "And say: My Lord, increase me in knowledge." — Quran 20:114
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

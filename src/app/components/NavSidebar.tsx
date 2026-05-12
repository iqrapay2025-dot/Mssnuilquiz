import { Link, useLocation, useNavigate } from 'react-router';
import {
  BookOpen, Upload, BarChart2, Trophy,
  FileText, Home, Play, ChevronRight,
} from 'lucide-react';
import { useQuiz } from '../store/quizStore';
const mssnLogo = new URL('../../imports/mssn_logo-removebg-preview__3_.png', import.meta.url).href;

const navItems = [
  { path: '/', label: 'Home', icon: Home, section: 'main' },
  { path: '/questions', label: 'Question Bank', icon: BookOpen, section: 'content' },
  { path: '/import', label: 'Import Questions', icon: Upload, section: 'content' },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, section: 'competition' },
  { path: '/logs', label: 'Session Logs', icon: FileText, section: 'competition' },
  { path: '/stats', label: 'Statistics', icon: BarChart2, section: 'competition' },
];

interface NavSidebarProps {
  children: React.ReactNode;
}

export function NavSidebar({ children }: NavSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useQuiz();

  const qCount = state.questions.length;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#f3f6f4' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col w-60 flex-shrink-0 border-r sticky top-0 h-screen"
        style={{
          background: '#ffffff',
          borderColor: 'rgba(229,235,231,0.7)',
          boxShadow: '2px 0 16px rgba(11,93,59,0.06)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(229,235,231,0.8)' }}
        >
          <div
            className="w-14 h-14 flex items-center justify-center flex-shrink-0 rounded-xl"
            style={{ background: '#ffffff', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: '1px solid rgba(229,235,231,0.9)' }}
          >
            <img
              src={mssnLogo}
              alt="MSSN Logo"
              style={{
                width: 52,
                height: 52,
                objectFit: 'contain',
              }}
            />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm" style={{ color: '#111827' }}>MSSN Quiz</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Championship</p>
          </div>
        </div>

        {/* Start Competition CTA */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => navigate('/setup')}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #0B5D3B, #157A49)',
              boxShadow: '0 3px 10px rgba(11,93,59,0.3)',
            }}
          >
            <Play className="w-4 h-4" />
            Start Competition
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest px-2 mb-2 mt-2"
            style={{ color: '#9ca3af' }}
          >
            Content
          </p>
          {navItems
            .filter(n => n.section === 'content' || n.section === 'main')
            .map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all group"
                  style={{
                    background: active
                      ? 'rgba(11,93,59,0.1)'
                      : 'transparent',
                    color: active ? '#0B5D3B' : '#374151',
                  }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? '#0B5D3B' : '#9ca3af' }}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Question Bank' && qCount > 0 && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#dcfce7', color: '#166534' }}
                    >
                      {qCount}
                    </span>
                  )}
                </Link>
              );
            })}

          <p
            className="text-xs font-semibold uppercase tracking-widest px-2 mb-2 mt-4"
            style={{ color: '#9ca3af' }}
          >
            Competition
          </p>
          {navItems
            .filter(n => n.section === 'competition')
            .map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all"
                  style={{
                    background: active ? 'rgba(11,93,59,0.1)' : 'transparent',
                    color: active ? '#0B5D3B' : '#374151',
                  }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? '#0B5D3B' : '#9ca3af' }}
                  />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Quick stats */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(240,244,241,0.8)' }}
        >
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: '#9ca3af' }}
          >
            <span>{state.questions.filter(q => !q.used).length} ready</span>
            <span>{state.faculties.length} faculties</span>
          </div>
          <p className="text-xs mt-2" style={{ color: '#d1d5db' }}>
            MSSN Jihad Week © 2025
          </p>
        </div>
      </aside>

      {/* Main content — scrollable container with ID for BackToTop */}
      <div id="main-scroll" className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

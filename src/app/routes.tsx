import { createBrowserRouter, Outlet } from 'react-router';
import { QuizProvider } from './store/quizStore';
import { PageLoader } from './components/PageLoader';
import { BackToTop } from './components/BackToTop';
import SplashScreen from './pages/SplashScreen';
import SetupScreen from './pages/SetupScreen';
import ReadyScreen from './pages/ReadyScreen';
import ProjectorDisplay from './pages/ProjectorDisplay';
import ModeratorDashboard from './pages/ModeratorDashboard';
import SessionResult from './pages/SessionResult';
import Leaderboard from './pages/Leaderboard';
import WinnerCeremony from './pages/WinnerCeremony';
import QuestionManager from './pages/QuestionManager';
import ImportQuestions from './pages/ImportQuestions';
import SessionLogs from './pages/SessionLogs';
import Statistics from './pages/Statistics';

function Root() {
  return (
    <QuizProvider>
      {/* Global page transition loader + initial splash */}
      <PageLoader />
      {/* Global back-to-top button */}
      <BackToTop />
      <Outlet />
    </QuizProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: SplashScreen },
      { path: 'setup', Component: SetupScreen },
      { path: 'ready', Component: ReadyScreen },
      { path: 'quiz', Component: ProjectorDisplay },
      { path: 'moderator', Component: ModeratorDashboard },
      { path: 'results', Component: SessionResult },
      { path: 'leaderboard', Component: Leaderboard },
      { path: 'winner', Component: WinnerCeremony },
      { path: 'questions', Component: QuestionManager },
      { path: 'import', Component: ImportQuestions },
      { path: 'logs', Component: SessionLogs },
      { path: 'stats', Component: Statistics },
    ],
  },
]);

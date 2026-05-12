import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import {
  AppState, QuizSession, Question, Faculty,
  SessionConfig, SessionAnswer, SessionLog, SessionStatus
} from './types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getMultiplier(timeTaken: number, enabled: boolean): number {
  if (!enabled) return 1;
  if (timeTaken <= 2) return 2;
  if (timeTaken <= 5) return 1.5;
  return 1;
}

type Action =
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'ADD_QUESTIONS'; payload: Question[] }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'RESET_ALL_USED' }
  | { type: 'ADD_FACULTY'; payload: Faculty }
  | { type: 'UPDATE_FACULTY'; payload: Faculty }
  | { type: 'DELETE_FACULTY'; payload: string }
  | { type: 'START_SESSION'; payload: SessionConfig }
  | { type: 'RESUME_SESSION' }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'MARK_ANSWER'; payload: { correct: boolean } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'UNDO' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'RESET_SESSION' }
  | { type: 'TICK_TIMER' }
  | { type: 'SYNC_SESSION'; payload: QuizSession | null }
  | { type: 'CLEAR_LOGS' };

const defaultState: AppState = {
  questions: [],
  faculties: [],
  currentSession: null,
  sessionLogs: [],
};

function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem('mssn-quiz-state-v2');
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      if (parsed.currentSession) {
        parsed.currentSession.timerRunning = false;
        if (parsed.currentSession.status === 'active') {
          parsed.currentSession.status = 'paused';
        }
      }
      return { ...defaultState, ...parsed };
    }
  } catch (_) {}
  return defaultState;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, action.payload] };

    case 'ADD_QUESTIONS': {
      const existingSet = new Set(state.questions.map(q => q.question.toLowerCase().trim()));
      const newOnes = action.payload.filter(q => !existingSet.has(q.question.toLowerCase().trim()));
      return { ...state, questions: [...state.questions, ...newOnes] };
    }

    case 'UPDATE_QUESTION':
      return { ...state, questions: state.questions.map(q => q.id === action.payload.id ? action.payload : q) };

    case 'DELETE_QUESTION':
      return { ...state, questions: state.questions.filter(q => q.id !== action.payload) };

    case 'RESET_ALL_USED':
      return { ...state, questions: state.questions.map(q => ({ ...q, used: false })) };

    case 'ADD_FACULTY':
      return { ...state, faculties: [...state.faculties, action.payload] };

    case 'UPDATE_FACULTY':
      return { ...state, faculties: state.faculties.map(f => f.id === action.payload.id ? action.payload : f) };

    case 'DELETE_FACULTY':
      return { ...state, faculties: state.faculties.filter(f => f.id !== action.payload) };

    case 'START_SESSION': {
      const config = action.payload;
      let available = state.questions.filter(q => !q.used);
      if (available.length < config.numQuestions) {
        // Reset used and use all
        available = state.questions.map(q => ({ ...q, used: false }));
      }
      const shuffled = shuffleArray(available);
      const selected = shuffled.slice(0, config.numQuestions);
      const selectedIds = new Set(selected.map(q => q.id));
      const updatedQuestions = state.questions.map(q => ({
        ...q,
        used: q.used || selectedIds.has(q.id),
      }));

      // Ensure faculty exists
      let faculties = [...state.faculties];
      const existingFaculty = faculties.find(
        f => f.name.toLowerCase() === config.facultyName.toLowerCase()
      );
      const facultyId = existingFaculty?.id || config.facultyId;
      if (!existingFaculty) {
        faculties.push({ id: facultyId, name: config.facultyName, maleScore: 0, femaleScore: 0 });
      }

      const session: QuizSession = {
        id: generateId(),
        config: { ...config, facultyId },
        questions: selected,
        currentIndex: 0,
        score: 0,
        timeRemaining: config.totalTime,
        timerRunning: false,
        answerRevealed: false,
        questionTimerAtStart: config.totalTime,
        currentMultiplier: 1,
        currentTimeTaken: 0,
        status: 'idle',
        answers: [],
        undoSnapshot: null,
      };

      return { ...state, questions: updatedQuestions, faculties, currentSession: session };
    }

    case 'RESUME_SESSION': {
      if (!state.currentSession) return state;
      const { status } = state.currentSession;
      if (status !== 'paused' && status !== 'idle') return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          timerRunning: true,
          status: 'active',
          // Only reset questionTimerAtStart on initial start
          ...(status === 'idle' && { questionTimerAtStart: state.currentSession.config.totalTime }),
        },
      };
    }

    case 'REVEAL_ANSWER': {
      if (!state.currentSession) return state;
      const session = state.currentSession;
      if (session.status !== 'active') return state;
      const timeTaken = session.questionTimerAtStart - session.timeRemaining;
      const multiplier = getMultiplier(timeTaken, session.config.enableMultipliers);
      return {
        ...state,
        currentSession: {
          ...session,
          answerRevealed: true,
          timerRunning: false,
          status: 'revealed',
          currentMultiplier: multiplier,
          currentTimeTaken: timeTaken,
        },
      };
    }

    case 'MARK_ANSWER': {
      if (!state.currentSession) return state;
      const session = state.currentSession;
      if (session.status !== 'revealed') return state;
      const isAnswered = session.answers.length > session.currentIndex;
      if (isAnswered) return state;
      const { correct } = action.payload;
      const points = correct
        ? Math.round(session.config.pointsPerQuestion * session.currentMultiplier)
        : 0;
      const currentQ = session.questions[session.currentIndex];
      const answer: SessionAnswer = {
        questionId: currentQ.id,
        questionText: currentQ.question,
        answerText: currentQ.answer,
        correct,
        points,
        timeTaken: session.currentTimeTaken,
        multiplier: session.currentMultiplier,
      };
      const undoSnapshot = { score: session.score, answers: [...session.answers] };
      return {
        ...state,
        currentSession: {
          ...session,
          score: session.score + points,
          answers: [...session.answers, answer],
          undoSnapshot,
        },
      };
    }

    case 'NEXT_QUESTION': {
      if (!state.currentSession) return state;
      const session = state.currentSession;
      const nextIndex = session.currentIndex + 1;
      if (nextIndex >= session.questions.length) {
        return {
          ...state,
          currentSession: { ...session, status: 'completed', timerRunning: false },
        };
      }
      const isTimeUp = session.status === 'timeup' || session.timeRemaining <= 0;
      return {
        ...state,
        currentSession: {
          ...session,
          currentIndex: nextIndex,
          answerRevealed: false,
          timerRunning: !isTimeUp,
          questionTimerAtStart: session.timeRemaining,
          currentMultiplier: 1,
          currentTimeTaken: 0,
          status: isTimeUp ? 'timeup' : 'active',
          undoSnapshot: null,
        },
      };
    }

    case 'UNDO': {
      if (!state.currentSession?.undoSnapshot) return state;
      const session = state.currentSession;
      const { undoSnapshot } = session;
      return {
        ...state,
        currentSession: {
          ...session,
          score: undoSnapshot.score,
          answers: undoSnapshot.answers,
          status: 'revealed',
          answerRevealed: true,
          timerRunning: false,
          undoSnapshot: null,
        },
      };
    }

    case 'PAUSE_SESSION': {
      if (!state.currentSession) return state;
      if (state.currentSession.status !== 'active') return state;
      return {
        ...state,
        currentSession: { ...state.currentSession, timerRunning: false, status: 'paused' },
      };
    }

    case 'TICK_TIMER': {
      if (!state.currentSession?.timerRunning) return state;
      const newTime = state.currentSession.timeRemaining - 1;
      if (newTime <= 0) {
        return {
          ...state,
          currentSession: {
            ...state.currentSession,
            timeRemaining: 0,
            timerRunning: false,
            status: 'timeup',
          },
        };
      }
      return {
        ...state,
        currentSession: { ...state.currentSession, timeRemaining: newTime },
      };
    }

    case 'END_SESSION': {
      if (!state.currentSession) return state;
      const session = state.currentSession;
      const updatedFaculties = state.faculties.map(f => {
        if (f.id === session.config.facultyId) {
          return {
            ...f,
            maleScore: session.config.sessionType === 'Male' ? f.maleScore + session.score : f.maleScore,
            femaleScore: session.config.sessionType === 'Female' ? f.femaleScore + session.score : f.femaleScore,
          };
        }
        return f;
      });
      const log: SessionLog = {
        id: generateId(),
        date: new Date().toISOString(),
        facultyName: session.config.facultyName,
        sessionType: session.config.sessionType,
        score: session.score,
        totalQuestions: session.questions.length,
        answers: session.answers,
        config: session.config,
      };
      return {
        ...state,
        faculties: updatedFaculties,
        currentSession: { ...session, status: 'completed', timerRunning: false },
        sessionLogs: [...state.sessionLogs, log],
      };
    }

    case 'RESET_SESSION':
      return { ...state, currentSession: null };

    case 'SYNC_SESSION':
      return { ...state, currentSession: action.payload };

    case 'CLEAR_LOGS':
      return { ...state, sessionLogs: [] };

    default:
      return state;
  }
}

interface QuizContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const receivingBroadcast = useRef(false);
  const prevSessionStr = useRef(JSON.stringify(state.currentSession));

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('mssn-quiz-sync');
      channelRef.current.onmessage = (e) => {
        if (e.data.type === 'SESSION_SYNC') {
          receivingBroadcast.current = true;
          dispatch({ type: 'SYNC_SESSION', payload: e.data.session });
        }
      };
    } catch (_) {}
    return () => channelRef.current?.close();
  }, []);

  // Broadcast session changes (prevent loops)
  useEffect(() => {
    if (receivingBroadcast.current) {
      receivingBroadcast.current = false;
      prevSessionStr.current = JSON.stringify(state.currentSession);
      return;
    }
    const newStr = JSON.stringify(state.currentSession);
    if (newStr !== prevSessionStr.current) {
      channelRef.current?.postMessage({ type: 'SESSION_SYNC', session: state.currentSession });
      prevSessionStr.current = newStr;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mssn-quiz-state-v2', JSON.stringify(state));
    } catch (_) {}
  }, [state]);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
export type Category = 'Quran' | 'Hadith' | 'Seerah' | 'Aqeedah' | 'Fiqh' | 'General Knowledge';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type SessionType = 'Male' | 'Female';
export type SessionStatus = 'idle' | 'active' | 'paused' | 'revealed' | 'timeup' | 'completed';

export interface Question {
  id: string;
  question: string;
  answer: string;
  category: Category;
  difficulty: Difficulty;
  used: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  maleScore: number;
  femaleScore: number;
}

export interface SessionConfig {
  facultyId: string;
  facultyName: string;
  sessionType: SessionType;
  teamMembers: string[];
  numQuestions: number;
  totalTime: number;
  pointsPerQuestion: number;
  enableMultipliers: boolean;
}

export interface SessionAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
  correct: boolean;
  points: number;
  timeTaken: number;
  multiplier: number;
}

export interface QuizSession {
  id: string;
  config: SessionConfig;
  questions: Question[];
  currentIndex: number;
  score: number;
  timeRemaining: number;
  timerRunning: boolean;
  answerRevealed: boolean;
  questionTimerAtStart: number;
  currentMultiplier: number;
  currentTimeTaken: number;
  status: SessionStatus;
  answers: SessionAnswer[];
  undoSnapshot: {
    score: number;
    answers: SessionAnswer[];
  } | null;
}

export interface SessionLog {
  id: string;
  date: string;
  facultyName: string;
  sessionType: SessionType;
  score: number;
  totalQuestions: number;
  answers: SessionAnswer[];
  config: SessionConfig;
}

export interface AppState {
  questions: Question[];
  faculties: Faculty[];
  currentSession: QuizSession | null;
  sessionLogs: SessionLog[];
}

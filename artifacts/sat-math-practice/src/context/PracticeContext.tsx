import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  answersMatch,
  QUESTIONS,
  type TopicId,
} from '../questions';
import type { Language } from '../i18n';

const STORAGE_KEYS = {
  session: 'sat-math-practice.session.v1',
  scores: 'sat-math-practice.scores.v1',
  result: 'sat-math-practice.latest-result.v1',
  language: 'sat-math-practice.language.v1',
};
const MODULE_QUESTION_COUNT = 15;
const MODULE_DURATION_MS = 35 * 60 * 1000;

export interface PracticeSession {
  id: string;
  mode: 'test' | 'topic';
  topic?: TopicId;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string>;
  eliminated: Record<string, string[]>;
  flagged: string[];
  timerEndsAt: number | null;
  timerHidden: boolean;
}

export interface ScoreEntry {
  id: string;
  mode: 'test' | 'topic';
  topic?: TopicId;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  completedAt: string;
}

export interface CompletedResult extends ScoreEntry {
  questionIds: string[];
  answers: Record<string, string>;
}

interface PracticeContextValue {
  ready: boolean;
  storageIssue: boolean;
  language: Language;
  session: PracticeSession | null;
  scores: ScoreEntry[];
  latestResult: CompletedResult | null;
  setLanguage: (language: Language) => void;
  startTest: () => void;
  startTopic: (topic: TopicId) => void;
  setAnswer: (questionId: string, answer: string) => void;
  toggleEliminated: (questionId: string, optionId: string) => void;
  toggleFlag: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  goToPreviousQuestion: () => void;
  startSecondModule: () => void;
  toggleTimerVisibility: () => void;
  finishSession: () => void;
}

const PracticeContext = createContext<PracticeContextValue | null>(null);

function makeSession(
  mode: 'test' | 'topic',
  questionIds: string[],
  topic?: TopicId,
): PracticeSession {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    mode,
    topic,
    questionIds,
    currentIndex: 0,
    answers: {},
    eliminated: {},
    flagged: [],
    timerEndsAt: mode === 'test' ? Date.now() + MODULE_DURATION_MS : null,
    timerHidden: false,
  };
}

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storageIssue, setStorageIssue] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [latestResult, setLatestResult] = useState<CompletedResult | null>(null);

  useEffect(() => {
    let active = true;
    void AsyncStorage.multiGet(Object.values(STORAGE_KEYS))
      .then((items) => {
        if (!active) return;
        const stored = Object.fromEntries(items);
        const savedSession = stored[STORAGE_KEYS.session];
        const savedScores = stored[STORAGE_KEYS.scores];
        const savedResult = stored[STORAGE_KEYS.result];
        const savedLanguage = stored[STORAGE_KEYS.language];
        if (savedSession) {
          setSession(JSON.parse(savedSession) as PracticeSession);
        }
        if (savedScores) {
          setScores(JSON.parse(savedScores) as ScoreEntry[]);
        }
        if (savedResult) {
          setLatestResult(JSON.parse(savedResult) as CompletedResult);
        }
        if (savedLanguage === 'ar') setLanguageState('ar');
      })
      .catch(() => {
        if (active) setStorageIssue(true);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void AsyncStorage.multiSet([
      [STORAGE_KEYS.session, JSON.stringify(session)],
      [STORAGE_KEYS.scores, JSON.stringify(scores)],
      [STORAGE_KEYS.result, JSON.stringify(latestResult)],
      [STORAGE_KEYS.language, language],
    ]).catch(() => setStorageIssue(true));
  }, [ready, session, scores, latestResult, language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const startTest = useCallback(() => {
    setSession(makeSession('test', QUESTIONS.map((question) => question.id)));
  }, []);

  const startTopic = useCallback((topic: TopicId) => {
    setSession(
      makeSession(
        'topic',
        QUESTIONS.filter((question) => question.topic === topic).map(
          (question) => question.id,
        ),
        topic,
      ),
    );
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setSession((current) =>
      current
        ? {
            ...current,
            answers: { ...current.answers, [questionId]: answer },
          }
        : current,
    );
  }, []);

  const toggleEliminated = useCallback(
    (questionId: string, optionId: string) => {
      setSession((current) => {
        if (!current) return current;
        const existing = current.eliminated[questionId] ?? [];
        const eliminated = existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId];
        const answers =
          !existing.includes(optionId) &&
          current.answers[questionId] === optionId
            ? { ...current.answers, [questionId]: '' }
            : current.answers;
        return {
          ...current,
          answers,
          eliminated: { ...current.eliminated, [questionId]: eliminated },
        };
      });
    },
    [],
  );

  const toggleFlag = useCallback((questionId: string) => {
    setSession((current) => {
      if (!current) return current;
      const flagged = current.flagged.includes(questionId)
        ? current.flagged.filter((id) => id !== questionId)
        : [...current.flagged, questionId];
      return { ...current, flagged };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setSession((current) => {
      if (!current) return current;
      const minIndex =
        current.mode === 'test' && current.currentIndex >= MODULE_QUESTION_COUNT
          ? MODULE_QUESTION_COUNT
          : 0;
      const maxIndex =
        current.mode === 'test' && current.currentIndex < MODULE_QUESTION_COUNT
          ? MODULE_QUESTION_COUNT - 1
          : current.questionIds.length - 1;
      return {
        ...current,
        currentIndex: Math.max(minIndex, Math.min(maxIndex, index)),
      };
    });
  }, []);

  const goToPreviousQuestion = useCallback(() => {
    setSession((current) => {
      if (!current) return current;
      const moduleStart =
        current.mode === 'test' &&
        current.currentIndex >= MODULE_QUESTION_COUNT
          ? MODULE_QUESTION_COUNT
          : 0;
      return {
        ...current,
        currentIndex: Math.max(moduleStart, current.currentIndex - 1),
      };
    });
  }, []);

  const startSecondModule = useCallback(() => {
    setSession((current) =>
      current?.mode === 'test'
        ? {
            ...current,
            currentIndex: MODULE_QUESTION_COUNT,
            timerEndsAt: Date.now() + MODULE_DURATION_MS,
          }
        : current,
    );
  }, []);

  const toggleTimerVisibility = useCallback(() => {
    setSession((current) =>
      current ? { ...current, timerHidden: !current.timerHidden } : current,
    );
  }, []);

  const finishSession = useCallback(() => {
    if (!session) return;
    const correctCount = session.questionIds.reduce((count, questionId) => {
      const question = QUESTIONS.find((item) => item.id === questionId);
      return question && answersMatch(question, session.answers[questionId] ?? '')
        ? count + 1
        : count;
    }, 0);
    const answeredCount = session.questionIds.filter(
      (questionId) => !!session.answers[questionId]?.trim(),
    ).length;
    const completedAt = new Date().toISOString();
    const score: CompletedResult = {
      id: session.id,
      mode: session.mode,
      topic: session.topic,
      questionCount: session.questionIds.length,
      correctCount,
      wrongCount: answeredCount - correctCount,
      unansweredCount: session.questionIds.length - answeredCount,
      completedAt,
      questionIds: session.questionIds,
      answers: session.answers,
    };
    setLatestResult(score);
    setScores((previous) =>
      [
        {
          id: score.id,
          mode: score.mode,
          topic: score.topic,
          questionCount: score.questionCount,
          correctCount: score.correctCount,
          wrongCount: score.wrongCount,
          unansweredCount: score.unansweredCount,
          completedAt: score.completedAt,
        },
        ...previous,
      ].slice(0, 12),
    );
    setSession(null);
  }, [session]);

  const value = useMemo(
    () => ({
      ready,
      storageIssue,
      language,
      session,
      scores,
      latestResult,
      setLanguage,
      startTest,
      startTopic,
      setAnswer,
      toggleEliminated,
      toggleFlag,
      goToQuestion,
      goToPreviousQuestion,
      startSecondModule,
      toggleTimerVisibility,
      finishSession,
    }),
    [
      ready,
      storageIssue,
      language,
      session,
      scores,
      latestResult,
      setLanguage,
      startTest,
      startTopic,
      setAnswer,
      toggleEliminated,
      toggleFlag,
      goToQuestion,
      goToPreviousQuestion,
      startSecondModule,
      toggleTimerVisibility,
      finishSession,
    ],
  );

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used inside PracticeProvider');
  }
  return context;
}

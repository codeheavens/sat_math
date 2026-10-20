import rawQuestions from '../data/questions.json';

export type TopicId =
  | 'Algebra'
  | 'Advanced Math'
  | 'Problem-Solving and Data Analysis'
  | 'Geometry and Trigonometry';

export interface AnswerOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface PracticeQuestion {
  id: string;
  topic: TopicId;
  type: 'multiple-choice' | 'student-response';
  question: string;
  options?: AnswerOption[];
  answer: string;
  explanation: string;
}

export const QUESTIONS = rawQuestions as PracticeQuestion[];
export const QUESTION_BY_ID = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, question]),
) as Record<string, PracticeQuestion>;

export const TOPICS: {
  id: TopicId;
  label: string;
  arabic: string;
  icon: 'trending-up' | 'activity' | 'bar-chart-2' | 'triangle';
  description: string;
  arabicDescription: string;
}[] = [
  {
    id: 'Algebra',
    label: 'Algebra',
    arabic: 'الجبر',
    icon: 'trending-up',
    description: 'Linear equations, inequalities, and systems',
    arabicDescription: 'المعادلات الخطية والمتباينات والأنظمة',
  },
  {
    id: 'Advanced Math',
    label: 'Advanced Math',
    arabic: 'الرياضيات المتقدمة',
    icon: 'activity',
    description: 'Functions, quadratics, and exponents',
    arabicDescription: 'الدوال والمعادلات التربيعية والأسس',
  },
  {
    id: 'Problem-Solving and Data Analysis',
    label: 'Problem-Solving and Data Analysis',
    arabic: 'حل المسائل وتحليل البيانات',
    icon: 'bar-chart-2',
    description: 'Ratios, rates, percentages, and statistics',
    arabicDescription: 'النسب والمعدلات المئوية والإحصاء',
  },
  {
    id: 'Geometry and Trigonometry',
    label: 'Geometry and Trigonometry',
    arabic: 'الهندسة وعلم المثلثات',
    icon: 'triangle',
    description: 'Shapes, measurement, and right triangles',
    arabicDescription: 'الأشكال والقياس والمثلثات القائمة',
  },
];

export function answersMatch(question: PracticeQuestion, answer: string) {
  if (!answer.trim()) return false;
  if (question.type === 'multiple-choice') {
    return answer.trim().toUpperCase() === question.answer.toUpperCase();
  }

  const actual = Number(answer.replace(/,/g, '').trim());
  const expected = Number(question.answer.replace(/,/g, '').trim());
  return Number.isFinite(actual) && Number.isFinite(expected) && actual === expected;
}

export function answerLabel(question: PracticeQuestion, answer: string) {
  if (!answer) return '';
  if (question.type === 'student-response') return answer;
  const option = question.options?.find((item) => item.id === answer);
  return option ? `${option.id}. ${option.text}` : answer;
}

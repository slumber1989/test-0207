
export interface UserProfile {
  role: string;          // 职业/角色
  level: string;         // 水平：0基础/基础/进阶
  goal: string;          // 目标：就业/考证/提升
  timeCommitment: string; // 每周学习时间
  skills: string[];      // 技能偏好
}

export interface Task {
  id?: string;
  title: string;
  type: 'video' | 'practice' | 'quiz' | 'doc';
  description: string;
  duration: string;
  isPro?: boolean; // Deprecated but kept optional for compatibility with old data structure if needed
  status?: 'locked' | 'pending' | 'completed'; // For UI tracking
}

export interface WeeklyPlan {
  week: number;
  theme: string;
  tasks: Task[];
  outcome: string; // 本周预期收获
}

export interface LearningPhase {
  id: string;
  title: string; // 阶段标题
  goal: string;  // 阶段目标
  weeks: WeeklyPlan[];
}

export interface LearningPath {
  id: string;
  title: string;
  totalDuration: string;
  description: string; // 整体周期描述
  tags?: string[];     // 关键词标签
  phases: LearningPhase[];
}

export type Course = LearningPath;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for screenshots
  timestamp: Date;
}

export interface AnalyticsData {
  radarData: { subject: string; A: number; fullMark: number }[];
  progressData: { day: string; hours: number }[];
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
}

export interface Bootcamp {
  id: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index
}

export interface AINote {
  id: string;
  timestamp: string;
  content: string;
  tag: 'KeyPoint' | 'Summary' | 'Code';
}

export interface FlashCard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

export interface TranscriptLine {
    time: string;
    text: string;
}

export interface CodeEvaluation {
  output: string;
  pass: boolean;
  feedback: string;
}

export type ClassroomTab = 'companion' | 'mindmap' | 'notes' | 'flashcards';

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  PATH_VIEW = 'PATH_VIEW',
  CLASSROOM = 'CLASSROOM',
  ANALYTICS = 'ANALYTICS',
  KNOWLEDGE_GRAPH = 'KNOWLEDGE_GRAPH'
}

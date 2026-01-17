
export interface VideoEntry {
  title: string;
  channelName: string;
  time: string;
}

export interface TakeoutVideo {
  header: string;
  title: string;
  titleUrl?: string;
  subtitles?: Array<{ name: string; url: string }>;
  time: string;
  products: string[];
}

export interface SkillScore {
  [key: string]: any;
  name: string;
  value: number;
}

export interface DomainScore {
  [key: string]: any;
  name: string;
  percentage: number;
  color: string;
}

export interface CareerMatch {
  title: string;
  matchScore: number;
  reason: string;
  skillsNeeded: string[];
  roadmapSteps: string[];
}

export interface AnalysisResult {
  metadata: {
    totalVideos: number;
    dateRange: string;
    learningRatio: number; // 0-100
  };
  domains: DomainScore[];
  skills: SkillScore[];
  summary: string;
  recommendations: CareerMatch[];
}

export type AppState = 'landing' | 'onboarding' | 'processing' | 'dashboard';

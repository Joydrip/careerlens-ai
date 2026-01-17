/**
 * Database Schema Types
 * Defines data models for PostgreSQL/MongoDB storage
 */

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
  consentGiven: boolean;
  consentDate: Date;
}

export interface WatchHistoryRaw {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  description?: string;
  publishedAt: Date;
  watchedAt: Date;
  categoryId?: string;
  tags?: string[];
  thumbnailUrl?: string;
  rawData: Record<string, any>; // Store full API response
  createdAt: Date;
}

export interface VideoMetadata {
  id: string;
  videoId: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  description?: string;
  enrichedAt: Date;
}

export interface AnalysisFeatures {
  id: string;
  userId: string;
  categoryPercentages: Record<string, number>;
  skillScores: Record<string, number>;
  topicClusterDistribution: Record<string, number>;
  learningRatio: number;
  entertainmentRatio: number;
  beginnerRatio: number;
  intermediateRatio: number;
  advancedRatio: number;
  featureVector: number[];
  computedAt: Date;
}

export interface CareerScores {
  id: string;
  userId: string;
  careerTitle: string;
  matchScore: number;
  contributingFactors: string[];
  skillsInferred: string[];
  missingSkills: string[];
  confidence: 'high' | 'medium' | 'low';
  computedAt: Date;
}

// Session storage (Redis)
export interface UserSession {
  sessionId: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
}

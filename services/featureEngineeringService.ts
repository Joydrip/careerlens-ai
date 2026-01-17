/**
 * Feature Engineering Service
 * Converts enriched data into ML-usable features
 */

import { EnrichedVideo, EnrichmentResult } from './enrichmentService';

export interface UserFeatures {
  // Category features
  categoryPercentages: Record<string, number>;
  
  // Skill features
  skillScores: Record<string, number>;
  
  // Temporal features
  watchFrequencyPerWeek: number;
  learningRatio: number;
  entertainmentRatio: number;
  
  // Topic features
  topicClusterDistribution: Record<string, number>;
  
  // Learning level features
  beginnerRatio: number;
  intermediateRatio: number;
  advancedRatio: number;
  
  // Feature vector for ML
  featureVector: number[];
}

export class FeatureEngineeringService {
  /**
   * Generate user features from enriched data
   */
  generateFeatures(enrichmentResult: EnrichmentResult): UserFeatures {
    const { enrichedVideos, categoryDistribution, skillFrequency, topicClusters, learningRatio } = enrichmentResult;

    const totalVideos = enrichedVideos.length;
    
    // Normalize category percentages
    const categoryPercentages: Record<string, number> = {};
    Object.entries(categoryDistribution).forEach(([category, count]) => {
      categoryPercentages[category] = (count / totalVideos) * 100;
    });

    // Normalize skill scores (0-100)
    const maxSkillCount = Math.max(...Object.values(skillFrequency), 1);
    const skillScores: Record<string, number> = {};
    Object.entries(skillFrequency).forEach(([skill, count]) => {
      skillScores[skill] = (count / maxSkillCount) * 100;
    });

    // Calculate topic cluster distribution
    const topicClusterDistribution: Record<string, number> = {};
    enrichedVideos.forEach(video => {
      video.topicClusters.forEach(cluster => {
        topicClusterDistribution[cluster] = (topicClusterDistribution[cluster] || 0) + 1;
      });
    });
    
    // Normalize topic clusters
    Object.keys(topicClusterDistribution).forEach(cluster => {
      topicClusterDistribution[cluster] = (topicClusterDistribution[cluster] / totalVideos) * 100;
    });

    // Calculate learning level ratios
    const beginnerCount = enrichedVideos.filter(v => v.learningLevel === 'beginner').length;
    const intermediateCount = enrichedVideos.filter(v => v.learningLevel === 'intermediate').length;
    const advancedCount = enrichedVideos.filter(v => v.learningLevel === 'advanced').length;

    const beginnerRatio = (beginnerCount / totalVideos) * 100;
    const intermediateRatio = (intermediateCount / totalVideos) * 100;
    const advancedRatio = (advancedCount / totalVideos) * 100;

    // Calculate watch frequency (assume 30-day window)
    const watchFrequencyPerWeek = totalVideos / 4; // Rough estimate

    // Calculate ratios
    const entertainmentRatio = 100 - learningRatio;

    // Generate feature vector (normalized values for ML)
    const featureVector = this.buildFeatureVector({
      categoryPercentages,
      skillScores,
      topicClusterDistribution,
      learningRatio,
      entertainmentRatio,
      beginnerRatio,
      intermediateRatio,
      advancedRatio,
    });

    return {
      categoryPercentages,
      skillScores,
      watchFrequencyPerWeek,
      learningRatio,
      entertainmentRatio,
      topicClusterDistribution,
      beginnerRatio,
      intermediateRatio,
      advancedRatio,
      featureVector,
    };
  }

  /**
   * Build normalized feature vector for ML models
   */
  private buildFeatureVector(features: Partial<UserFeatures>): number[] {
    const vector: number[] = [];

    // Category features (top 10 categories)
    const topCategories = Object.entries(features.categoryPercentages || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (let i = 0; i < 10; i++) {
      vector.push(topCategories[i]?.[1] || 0);
    }

    // Skill features (top 10 skills)
    const topSkills = Object.entries(features.skillScores || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (let i = 0; i < 10; i++) {
      vector.push(topSkills[i]?.[1] || 0);
    }

    // Topic cluster features
    vector.push(features.topicClusterDistribution?.['Technology'] || 0);
    vector.push(features.topicClusterDistribution?.['Creative'] || 0);
    vector.push(features.topicClusterDistribution?.['Business'] || 0);

    // Learning features
    vector.push(features.learningRatio || 0);
    vector.push(features.entertainmentRatio || 0);

    // Level features
    vector.push(features.beginnerRatio || 0);
    vector.push(features.intermediateRatio || 0);
    vector.push(features.advancedRatio || 0);

    return vector;
  }

  /**
   * Calculate cosine similarity between two feature vectors
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Feature vectors must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

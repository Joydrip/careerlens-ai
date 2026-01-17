/**
 * Career Recommendation Engine
 * Maps user interests to career paths using ML scoring and knowledge base
 */

import { UserFeatures } from './featureEngineeringService';

export interface CareerSkill {
  name: string;
  weight: number; // 0-1 importance weight
}

export interface CareerDefinition {
  title: string;
  requiredSkills: CareerSkill[];
  categoryWeights: Record<string, number>;
  description: string;
  typicalPaths: string[];
}

export interface CareerRecommendation {
  title: string;
  matchScore: number; // 0-100
  reason: string;
  contributingFactors: string[];
  skillsInferred: string[];
  missingSkills: string[];
  skillsNeeded: string[];
  roadmapSteps: string[];
  confidence: 'high' | 'medium' | 'low';
}

// Career Knowledge Base
const CAREER_KNOWLEDGE_BASE: CareerDefinition[] = [
  {
    title: 'Data Scientist',
    requiredSkills: [
      { name: 'Data Science', weight: 0.4 },
      { name: 'Programming', weight: 0.3 },
      { name: 'Statistics', weight: 0.2 },
      { name: 'Visualization', weight: 0.1 },
    ],
    categoryWeights: {
      'Science & Technology': 0.5,
      'Education': 0.3,
    },
    description: 'Analyze complex data to extract insights and build predictive models',
    typicalPaths: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
  },
  {
    title: 'Software Engineer',
    requiredSkills: [
      { name: 'Programming', weight: 0.5 },
      { name: 'DevOps', weight: 0.2 },
      { name: 'Problem Solving', weight: 0.3 },
    ],
    categoryWeights: {
      'Science & Technology': 0.6,
      'Education': 0.4,
    },
    description: 'Design, develop, and maintain software applications',
    typicalPaths: ['Computer Science', 'Software Development', 'System Design'],
  },
  {
    title: 'UX/UI Designer',
    requiredSkills: [
      { name: 'Design', weight: 0.5 },
      { name: 'User Research', weight: 0.3 },
      { name: 'Prototyping', weight: 0.2 },
    ],
    categoryWeights: {
      'Howto & Style': 0.4,
      'Education': 0.3,
    },
    description: 'Create intuitive and visually appealing user interfaces',
    typicalPaths: ['Design Principles', 'User Research', 'Prototyping Tools'],
  },
  {
    title: 'Product Manager',
    requiredSkills: [
      { name: 'Business', weight: 0.4 },
      { name: 'Marketing', weight: 0.3 },
      { name: 'Strategic Planning', weight: 0.3 },
    ],
    categoryWeights: {
      'Business': 0.5,
      'Education': 0.2,
    },
    description: 'Guide product strategy and coordinate cross-functional teams',
    typicalPaths: ['Business Strategy', 'Product Design', 'Market Research'],
  },
  {
    title: 'ML Engineer',
    requiredSkills: [
      { name: 'Data Science', weight: 0.4 },
      { name: 'Programming', weight: 0.4 },
      { name: 'DevOps', weight: 0.2 },
    ],
    categoryWeights: {
      'Science & Technology': 0.7,
      'Education': 0.3,
    },
    description: 'Build and deploy machine learning systems at scale',
    typicalPaths: ['Deep Learning', 'MLOps', 'Model Deployment'],
  },
  {
    title: 'Digital Marketer',
    requiredSkills: [
      { name: 'Marketing', weight: 0.5 },
      { name: 'Content Creation', weight: 0.3 },
      { name: 'Analytics', weight: 0.2 },
    ],
    categoryWeights: {
      'People & Blogs': 0.4,
      'Entertainment': 0.3,
    },
    description: 'Promote brands and products through digital channels',
    typicalPaths: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
  },
];

export class CareerRecommendationService {
  /**
   * Generate career recommendations based on user features
   */
  generateRecommendations(features: UserFeatures, topN: number = 3): CareerRecommendation[] {
    const scores = CAREER_KNOWLEDGE_BASE.map(career => ({
      career,
      score: this.calculateMatchScore(features, career),
    }));

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Generate recommendations with explanations
    return scores.slice(0, topN).map(({ career, score }) =>
      this.buildRecommendation(features, career, score)
    );
  }

  /**
   * Calculate match score using weighted cosine similarity
   */
  private calculateMatchScore(features: UserFeatures, career: CareerDefinition): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Skill-based scoring
    for (const careerSkill of career.requiredSkills) {
      const userSkillScore = features.skillScores[careerSkill.name] || 0;
      const weightedScore = userSkillScore * careerSkill.weight;
      totalScore += weightedScore;
      totalWeight += careerSkill.weight;
    }

    // Category-based scoring
    for (const [category, weight] of Object.entries(career.categoryWeights)) {
      const categoryScore = features.categoryPercentages[category] || 0;
      totalScore += categoryScore * weight;
      totalWeight += weight;
    }

    // Normalize to 0-100
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    return Math.round(Math.min(100, Math.max(0, normalizedScore)));
  }

  /**
   * Build recommendation with explainability
   */
  private buildRecommendation(
    features: UserFeatures,
    career: CareerDefinition,
    matchScore: number
  ): CareerRecommendation {
    // Identify contributing factors
    const contributingFactors: string[] = [];
    const skillsInferred: string[] = [];
    const missingSkills: string[] = [];

    // Analyze skill matches
    for (const careerSkill of career.requiredSkills) {
      const userScore = features.skillScores[careerSkill.name] || 0;
      if (userScore > 30) {
        skillsInferred.push(careerSkill.name);
        contributingFactors.push(
          `Strong interest in ${careerSkill.name} (${Math.round(userScore)}% match)`
        );
      } else {
        missingSkills.push(careerSkill.name);
      }
    }

    // Analyze category matches
    for (const [category, weight] of Object.entries(career.categoryWeights)) {
      const categoryScore = features.categoryPercentages[category] || 0;
      if (categoryScore > 10) {
        contributingFactors.push(
          `${categoryScore.toFixed(1)}% of watch history in ${category}`
        );
      }
    }

    // Generate reason
    const reason = this.generateReason(features, career, skillsInferred, contributingFactors);

    // Determine confidence
    const confidence: 'high' | 'medium' | 'low' = 
      matchScore >= 70 ? 'high' : matchScore >= 50 ? 'medium' : 'low';

    // Generate roadmap
    const roadmapSteps = this.generateRoadmap(career, missingSkills, skillsInferred);

    return {
      title: career.title,
      matchScore,
      reason,
      contributingFactors: contributingFactors.slice(0, 5),
      skillsInferred,
      missingSkills,
      skillsNeeded: career.requiredSkills.map(s => s.name),
      roadmapSteps,
      confidence,
    };
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private generateReason(
    features: UserFeatures,
    career: CareerDefinition,
    skillsInferred: string[],
    factors: string[]
  ): string {
    const topSkills = skillsInferred.slice(0, 3).join(', ');
    const learningRatio = features.learningRatio;

    let reason = `Your watch history shows strong alignment with ${career.title}. `;
    
    if (topSkills) {
      reason += `You consistently watch content related to ${topSkills}. `;
    }

    if (learningRatio > 60) {
      reason += `Your high learning-focused viewing pattern (${Math.round(learningRatio)}%) indicates serious interest in skill development. `;
    }

    if (factors.length > 0) {
      reason += `Key indicators include: ${factors.slice(0, 2).join('; ')}.`;
    }

    return reason;
  }

  /**
   * Generate learning roadmap
   */
  private generateRoadmap(
    career: CareerDefinition,
    missingSkills: string[],
    inferredSkills: string[]
  ): string[] {
    const roadmap: string[] = [];

    // Build on existing skills
    if (inferredSkills.length > 0) {
      roadmap.push(`Deepen expertise in ${inferredSkills[0]} through advanced courses`);
    }

    // Fill skill gaps
    if (missingSkills.length > 0) {
      roadmap.push(`Learn fundamentals of ${missingSkills[0]}`);
    }

    // Career-specific steps
    roadmap.push(`Build a portfolio project demonstrating ${career.title} skills`);
    roadmap.push(`Join ${career.title} communities and networks`);
    roadmap.push(`Seek mentorship from experienced ${career.title} professionals`);

    return roadmap.slice(0, 5);
  }
}

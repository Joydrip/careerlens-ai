/**
 * Data Enrichment Service
 * Enriches raw video data with NLP, categories, and skill taxonomy
 */

import { YouTubeVideo } from './youtubeDataService';

export interface EnrichedVideo extends YouTubeVideo {
  categories: string[];
  skillKeywords: string[];
  topicClusters: string[];
  isEducational: boolean;
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface EnrichmentResult {
  enrichedVideos: EnrichedVideo[];
  categoryDistribution: Record<string, number>;
  skillFrequency: Record<string, number>;
  topicClusters: string[];
  learningRatio: number;
}

// YouTube category mapping
const YOUTUBE_CATEGORIES: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
};

// Skill taxonomy keywords mapping
const SKILL_KEYWORDS: Record<string, string[]> = {
  'Programming': ['python', 'javascript', 'java', 'react', 'node', 'programming', 'coding', 'development', 'api', 'framework', 'typescript', 'vue', 'angular'],
  'Data Science': ['machine learning', 'ml', 'ai', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'statistics', 'analysis', 'visualization'],
  'Design': ['design', 'figma', 'ui', 'ux', 'photoshop', 'illustrator', 'sketch', 'prototyping', 'wireframe'],
  'Marketing': ['marketing', 'seo', 'advertising', 'social media', 'content', 'branding', 'strategy'],
  'Business': ['business', 'entrepreneurship', 'startup', 'finance', 'management', 'leadership'],
  'DevOps': ['docker', 'kubernetes', 'aws', 'cloud', 'ci/cd', 'devops', 'infrastructure'],
};

export class EnrichmentService {
  /**
   * Enrich video with categories and skills
   */
  async enrichVideo(video: YouTubeVideo): Promise<EnrichedVideo> {
    const categoryName = video.categoryId ? YOUTUBE_CATEGORIES[video.categoryId] || 'Unknown' : 'Unknown';
    
    // Extract skill keywords from title, description, and tags
    const skillKeywords = this.extractSkillKeywords(video);
    const topicClusters = this.identifyTopicClusters(video, skillKeywords);
    const isEducational = this.isEducationalContent(video, categoryName);
    const learningLevel = this.assessLearningLevel(video);

    return {
      ...video,
      categories: [categoryName],
      skillKeywords,
      topicClusters,
      isEducational,
      learningLevel,
    };
  }

  /**
   * Enrich batch of videos
   */
  async enrichVideos(videos: YouTubeVideo[]): Promise<EnrichedVideo[]> {
    return Promise.all(videos.map(video => this.enrichVideo(video)));
  }

  /**
   * Extract skill keywords from video metadata
   */
  private extractSkillKeywords(video: YouTubeVideo): string[] {
    const text = `${video.title} ${video.description} ${(video.tags || []).join(' ')}`.toLowerCase();
    const foundSkills: string[] = [];

    for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        foundSkills.push(skill);
      }
    }

    return foundSkills;
  }

  /**
   * Identify topic clusters using keywords
   */
  private identifyTopicClusters(video: YouTubeVideo, skills: string[]): string[] {
    const clusters: string[] = [];

    if (skills.includes('Programming') || skills.includes('Data Science')) {
      clusters.push('Technology');
    }
    if (skills.includes('Design')) {
      clusters.push('Creative');
    }
    if (skills.includes('Marketing') || skills.includes('Business')) {
      clusters.push('Business');
    }

    return clusters.length > 0 ? clusters : ['General'];
  }

  /**
   * Determine if content is educational
   */
  private isEducationalContent(video: YouTubeVideo, category: string): boolean {
    const educationalCategories = ['Education', 'Science & Technology', 'Howto & Style'];
    const educationalKeywords = ['tutorial', 'learn', 'course', 'lesson', 'how to', 'guide', 'explained'];
    
    const text = `${video.title} ${video.description}`.toLowerCase();
    const hasEducationalKeywords = educationalKeywords.some(kw => text.includes(kw));
    
    return educationalCategories.includes(category) || hasEducationalKeywords;
  }

  /**
   * Assess learning level based on video metadata
   */
  private assessLearningLevel(video: YouTubeVideo): 'beginner' | 'intermediate' | 'advanced' {
    const text = `${video.title} ${video.description}`.toLowerCase();
    
    if (text.includes('beginner') || text.includes('introduction') || text.includes('basics')) {
      return 'beginner';
    }
    if (text.includes('advanced') || text.includes('expert') || text.includes('deep dive')) {
      return 'advanced';
    }
    return 'intermediate';
  }

  /**
   * Process enrichment and generate features
   */
  async processEnrichment(videos: YouTubeVideo[]): Promise<EnrichmentResult> {
    const enrichedVideos = await this.enrichVideos(videos);

    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    enrichedVideos.forEach(video => {
      video.categories.forEach(cat => {
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
      });
    });

    // Calculate skill frequency
    const skillFrequency: Record<string, number> = {};
    enrichedVideos.forEach(video => {
      video.skillKeywords.forEach(skill => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      });
    });

    // Extract unique topic clusters
    const allClusters = enrichedVideos.flatMap(v => v.topicClusters);
    const topicClusters = Array.from(new Set(allClusters));

    // Calculate learning ratio
    const educationalCount = enrichedVideos.filter(v => v.isEducational).length;
    const learningRatio = videos.length > 0 ? (educationalCount / videos.length) * 100 : 0;

    return {
      enrichedVideos,
      categoryDistribution,
      skillFrequency,
      topicClusters,
      learningRatio,
    };
  }
}

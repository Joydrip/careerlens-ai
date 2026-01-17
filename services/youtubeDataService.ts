/**
 * YouTube Data API Service
 * Fetches watch history using YouTube Data API v3
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  watchedAt: string;
  categoryId?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

export interface WatchHistoryResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}

export class YouTubeDataService {
  private apiKey?: string;
  private accessToken?: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(accessToken: string, apiKey?: string) {
    this.accessToken = accessToken;
    this.apiKey = apiKey;
  }

  /**
   * Fetch watch history using activities.list endpoint
   */
  async fetchWatchHistory(maxResults: number = 50, pageToken?: string): Promise<WatchHistoryResponse> {
    if (!this.accessToken) {
      throw new Error('Access token required for YouTube API');
    }

    try {
      const params = new URLSearchParams({
        part: 'contentDetails,snippet',
        mine: 'true',
        maxResults: maxResults.toString(),
        ...(pageToken && { pageToken }),
      });

      const response = await fetch(`${this.baseUrl}/activities?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('YouTube Data API access denied. Please ensure you have granted the necessary permissions.');
        }
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Filter for watch history only
      const watchActivities = (data.items || []).filter(
        (item: any) => item.contentDetails?.upload || item.snippet?.type === 'upload'
      );

      // Enrich with video details
      const videos: YouTubeVideo[] = await Promise.all(
        watchActivities.map(async (activity: any) => {
          const videoId = activity.contentDetails?.upload?.videoId;
          if (!videoId) return null;

          // Fetch detailed video metadata
          const videoDetails = await this.getVideoDetails(videoId);
          
          return {
            id: videoId,
            title: activity.snippet?.title || 'Unknown',
            channelId: videoDetails.channelId || activity.snippet?.channelId || '',
            channelTitle: videoDetails.channelTitle || activity.snippet?.channelTitle || 'Unknown Channel',
            description: videoDetails.description || '',
            publishedAt: videoDetails.publishedAt || activity.snippet?.publishedAt || '',
            watchedAt: activity.snippet?.publishedAt || new Date().toISOString(),
            categoryId: videoDetails.categoryId,
            tags: videoDetails.tags,
            thumbnailUrl: videoDetails.thumbnailUrl,
          };
        })
      );

      return {
        videos: videos.filter((v): v is YouTubeVideo => v !== null),
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo?.totalResults || 0,
      };
    } catch (error) {
      console.error('YouTube watch history fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch all watch history (with pagination)
   */
  async fetchAllWatchHistory(maxPages: number = 10): Promise<YouTubeVideo[]> {
    const allVideos: YouTubeVideo[] = [];
    let pageToken: string | undefined;
    let pagesFetched = 0;

    do {
      const response = await this.fetchWatchHistory(50, pageToken);
      allVideos.push(...response.videos);
      pageToken = response.nextPageToken;
      pagesFetched++;
    } while (pageToken && pagesFetched < maxPages);

    return allVideos;
  }

  /**
   * Get detailed video metadata
   */
  async getVideoDetails(videoId: string): Promise<Partial<YouTubeVideo>> {
    if (!this.accessToken) {
      return {};
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics',
        id: videoId,
      });

      const response = await fetch(`${this.baseUrl}/videos?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      const video = data.items?.[0];

      if (!video) {
        return {};
      }

      return {
        categoryId: video.snippet?.categoryId,
        tags: video.snippet?.tags || [],
        description: video.snippet?.description || '',
        thumbnailUrl: video.snippet?.thumbnails?.medium?.url,
        publishedAt: video.snippet?.publishedAt,
        channelId: video.snippet?.channelId,
        channelTitle: video.snippet?.channelTitle,
      };
    } catch (error) {
      console.error('Video details fetch error:', error);
      return {};
    }
  }
}

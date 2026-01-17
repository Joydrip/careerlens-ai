/**
 * Google OAuth 2.0 Service
 * Handles user authentication and consent for YouTube Data API access
 */

export interface OAuthConfig {
  clientId: string;
  scope: string;
  redirectUri: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
const PROFILE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export class OAuthService {
  private clientId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private profile: UserProfile | null = null;

  constructor(clientId: string, redirectUri: string = window.location.origin) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  /**
   * Initiate Google OAuth flow
   */
  initiateOAuth(): void {
    const scope = `${YOUTUBE_READONLY_SCOPE} ${PROFILE_SCOPE}`;
    const state = this.generateState();
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirectUri: this.redirectUri }),
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const data = await response.json();
      this.accessToken = data.accessToken;
      
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      
      return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      throw error;
    }
  }

  /**
   * Get user profile from Google
   */
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      this.profile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      };
      
      return this.profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null || !!localStorage.getItem('access_token');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('access_token');
  }

  /**
   * Clear authentication
   */
  logout(): void {
    this.accessToken = null;
    this.profile = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Verify OAuth state
   */
  verifyState(state: string): boolean {
    const storedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    return storedState === state;
  }
}

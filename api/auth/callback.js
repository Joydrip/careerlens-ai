/**
 * Vercel Serverless Function for OAuth Callback
 * Handles GET requests from Google OAuth redirect
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      console.error('OAuth error:', oauthError);
      return res.status(400).json({ error: oauthError });
    }

    if (!code) {
      console.error('No authorization code provided');
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Get frontend URL from environment
    const frontendUrl = process.env.FRONTEND_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Redirect to frontend with the authorization code
    const redirectUrl = `${frontendUrl}/auth/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;

    console.log('Redirecting to:', redirectUrl);

    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed', details: error.message });
  }
}
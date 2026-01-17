/**
 * Vercel Serverless Function for Token Exchange
 * Handles POST requests to exchange authorization code for tokens
 */

import { google } from 'googleapis';

export default async function handler(req, res) {
  console.log('OAuth token exchange triggered:', req.method, req.url);
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Configure OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || process.env.GOOGLE_REDIRECT_URI || `https://${process.env.VERCEL_URL}/auth/callback`
    );

    console.log('Exchanging code for tokens...');

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log('Token exchange successful');

    res.json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({
      error: 'Token exchange failed',
      details: error.message
    });
  }
}
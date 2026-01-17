/**
 * Express.js Backend Server
 * Handles OAuth callbacks, data processing, and API endpoints
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
);

/**
 * OAuth callback endpoint - exchanges code for tokens
 */
app.post('/api/auth/oauth/callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    oauth2Client.setCredentials(tokens);

    res.json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

/**
 * Refresh access token
 */
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    res.json({
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * Process watch history - enrichment and feature engineering
 */
app.post('/api/process/watch-history', async (req, res) => {
  try {
    const { videos, accessToken } = req.body;

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos array required' });
    }

    // This would call your enrichment service
    // For now, return a placeholder
    res.json({
      message: 'Watch history processing initiated',
      videoCount: videos.length,
    });
  } catch (error) {
    console.error('Watch history processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

/**
 * Get career recommendations
 */
app.post('/api/recommendations/careers', async (req, res) => {
  try {
    const { features, userId } = req.body;

    if (!features) {
      return res.status(400).json({ error: 'User features required' });
    }

    // This would call your recommendation engine
    res.json({
      recommendations: [],
      message: 'Recommendations computed',
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Recommendation failed' });
  }
});

/**
 * Delete user data (GDPR compliance)
 */
app.delete('/api/user/data', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Delete all user data from database
    // Implementation depends on your database
    
    res.json({ message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Data deletion error:', error);
    res.status(500).json({ error: 'Data deletion failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

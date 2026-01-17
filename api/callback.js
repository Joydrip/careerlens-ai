export default async function handler(req, res) {
  console.log('OAuth callback:', req.method, req.url);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.status(400).json({ error: oauthError });
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    res.json({
      success: true,
      code: code,
      state: state,
      message: 'OAuth authorization code received'
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback failed', details: error.message });
  }
}
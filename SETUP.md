# Setup Guide - CareerLens AI

## Quick Start (Without OAuth)

You can use the app immediately without OAuth setup:

1. **Quick Demo** - Click "Quick Demo (Mock)" to test with sample data
2. **Upload Takeout File** - Upload your `watch-history.json` from Google Takeout

## Setting Up Google OAuth (Optional)

To enable "Sign in with Google" for real-time YouTube API access:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Give it a name (e.g., "CareerLens AI")

### Step 2: Enable YouTube Data API v3

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "YouTube Data API v3"
3. Click on it and click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in app name: "CareerLens AI"
   - Add your email to support email
   - Add scopes:
     - `https://www.googleapis.com/auth/youtube.readonly`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Add test users (your email) if in testing mode
4. Select **Web application**
5. Add **Authorized redirect URIs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000` (if needed)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_client_id_here` with the Client ID from Step 3.

### Step 5: Restart the Dev Server

After creating/updating `.env`:

1. Stop the dev server (Ctrl+C)
2. Restart it: `npm run dev`
3. The "Sign in with Google" button should now work

## Setting Up Gemini API (Optional - for AI analysis)

If you want enhanced AI-powered analysis:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key" and create a new key
3. Add it to your `.env` file as `GEMINI_API_KEY`
4. The app will use Gemini for enhanced analysis

## Troubleshooting

### "Missing required parameter: client_id"
- Make sure `.env` file exists in the root directory
- Ensure `VITE_GOOGLE_CLIENT_ID` is set correctly
- Restart the dev server after changing `.env`

### OAuth redirect error
- Make sure the redirect URI in Google Console matches exactly: `http://localhost:3000/auth/callback`
- Check that your app is added as a test user (if in testing mode)

### YouTube API quota exceeded
- The YouTube Data API has daily quotas
- Use "Upload Takeout File" as an alternative
- Check your quota in Google Cloud Console

## Current Status

- ✅ **Works without OAuth**: Use "Upload Takeout File" or "Quick Demo"
- ❌ **OAuth requires setup**: Follow steps above to enable

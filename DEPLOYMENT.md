# CareerLens AI - Deployment Guide

## 🚀 Free Hosting Setup (Vercel + GitHub)

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"**
3. Name: `careerlens-ai`
4. Make it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/careerlens-ai.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click **"Import Project"**
4. Select your `careerlens-ai` repository
5. Configure the project:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

### Step 4: Configure Environment Variables in Vercel

After deployment, go to your project settings in Vercel:

1. Click **"Settings"** → **"Environment Variables"**
2. Add these variables:

```
VITE_GOOGLE_CLIENT_ID=373027122455-52tcesoful07pao0l9eot613gp39scr0.apps.googleusercontent.com
GEMINI_API_KEY=AIzaSyCVKCSGngBfiVlttplp4XSuTSEt_pg35zU
GOOGLE_CLIENT_ID=373027122455-52tcesoful07pao0l9eot613gp39scr0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=https://[your-vercel-url]

   *(Replace [your-vercel-url] with your actual Vercel domain)*
```

### Step 5: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add these to **Authorized redirect URIs**:
   ```
   https://[your-vercel-url]/auth/callback

   *(Replace [your-vercel-url] with your actual Vercel domain)*
   ```
5. Add these to **Authorized JavaScript origins**:
   ```
   https://careerlens-ai.vercel.app
   ```
6. Click **"Save"**

### Step 6: Redeploy on Vercel

1. Go back to Vercel dashboard
2. Click on your project
3. Click **"Deployments"**
4. Click **"Redeploy"** to apply the environment variables

### Step 7: Get Your Client Secret

In Google Cloud Console → Credentials → Your OAuth Client ID:
1. Click the download button (JSON)
2. Find the `"client_secret"` value
3. Add it to Vercel environment variables as `GOOGLE_CLIENT_SECRET`

## 🎯 Your App Will Be Live At:

**https://careerlens-ai.vercel.app**

## 🔧 Available Features:

- ✅ **Sign in with Google** - Real-time YouTube API access
- ✅ **Upload Takeout File** - Manual file upload
- ✅ **Quick Demo** - Instant testing with sample data
- ✅ **Career Recommendations** - AI-powered analysis
- ✅ **Privacy Controls** - GDPR-compliant data management

## 🛠️ Troubleshooting:

### "OAuth redirect_uri_mismatch":
- Double-check the redirect URI in Google Console matches Vercel URL exactly

### "Client secret missing":
- Make sure you added `GOOGLE_CLIENT_SECRET` in Vercel environment variables

### "API calls failing":
- Check that `VITE_API_URL` is set correctly in Vercel
- Ensure the backend functions are deployed

### "Build failing":
- Check Vercel deployment logs for TypeScript/React errors
- Make sure all dependencies are in `package.json`

## 💰 Cost:

- **Free Tier**: 100GB bandwidth, unlimited deployments
- **Upgrade needed**: Only if you exceed free limits

## 🔄 Making Changes:

1. Make changes to your code locally
2. Commit and push to GitHub: `git add . && git commit -m "Your changes" && git push`
3. Vercel will automatically redeploy your changes

## 🌐 Custom Domain (Optional):

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update Google Cloud Console with new URLs

---

## 📝 Step-by-Step Deployment Checklist:

1. ✅ **Create GitHub Repository** - Done
2. ⏳ **Deploy to Vercel** - Follow steps above
3. ⏳ **Get Your Vercel URL** - Vercel will give you a unique URL
4. ⏳ **Update Google Cloud Console** - Use your actual Vercel URL
5. ⏳ **Update Environment Variables** - Use your actual Vercel URL
6. ⏳ **Redeploy** - Apply the environment variable changes

**Your CareerLens AI app will be live and accessible worldwide once deployed! 🎉**
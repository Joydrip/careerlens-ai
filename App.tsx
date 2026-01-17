
import React, { useState, useEffect, useCallback } from 'react';
import { Compass, History, Target, Settings, LogOut, Loader2, PlayCircle, ShieldCheck, LayoutDashboard, FileJson, AlertCircle, FileText } from 'lucide-react';
import { AppState, AnalysisResult, VideoEntry, TakeoutVideo } from './types';
import { MOCK_WATCH_HISTORY } from './mockData';
import { analyzeWatchHistory } from './services/geminiService';
import { OAuthService, UserProfile } from './services/oauthService';
import { YouTubeDataService } from './services/youtubeDataService';
import { EnrichmentService } from './services/enrichmentService';
import { FeatureEngineeringService } from './services/featureEngineeringService';
import { CareerRecommendationService } from './services/careerRecommendationService';
import Dashboard from './components/Dashboard';
import CareerRecommendations from './components/CareerRecommendations';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'careers'>('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [oauthService] = useState(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    return new OAuthService(clientId, redirectUri);
  });

  // Handle OAuth callback - removed automatic handling to prevent loops
  // OAuth flow is now handled entirely through the OAuth service

  const handleOAuthCallback = async (code: string) => {
    try {
      setAppState('processing');

      // Exchange code for tokens via API
      const apiUrl = import.meta.env.VITE_API_URL || 'https://careerlens-ai.vercel.app';
      const response = await fetch(`${apiUrl}/api/auth/oauth-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri: `${window.location.origin}/auth/callback`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token exchange failed');
      }

      const { accessToken } = await response.json();
      localStorage.setItem('access_token', accessToken);

      const profile = await oauthService.getUserProfile(accessToken);
      setUserProfile(profile);

      // Fetch YouTube watch history
      await fetchYouTubeHistory(accessToken);
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setError(err.message || 'Authentication failed');
      setAppState('onboarding');
    }
  };

  const fetchYouTubeHistory = async (accessToken: string) => {
    try {
      const youtubeService = new YouTubeDataService(accessToken);
      const videos = await youtubeService.fetchAllWatchHistory(10);

      if (videos.length === 0) {
        setError('No watch history found. Please ensure you have watched videos on YouTube.');
        setAppState('onboarding');
        return;
      }

      // Process through enrichment and feature engineering
      await processYouTubeVideos(videos);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch watch history');
      setAppState('onboarding');
    }
  };

  const processYouTubeVideos = async (youtubeVideos: any[]) => {
    try {
      // Enrich videos
      const enrichmentService = new EnrichmentService();
      const enrichmentResult = await enrichmentService.processEnrichment(youtubeVideos);

      // Generate features
      const featureService = new FeatureEngineeringService();
      const features = featureService.generateFeatures(enrichmentResult);

      // Generate career recommendations
      const careerService = new CareerRecommendationService();
      const recommendations = careerService.generateRecommendations(features, 3);

      // Convert to AnalysisResult format
      const domains = Object.entries(enrichmentResult.categoryDistribution).map(([name, count]) => ({
        name,
        percentage: (count / enrichmentResult.enrichedVideos.length) * 100,
        color: '#10b981',
      })).sort((a, b) => b.percentage - a.percentage);

      const skills = Object.entries(features.skillScores).map(([name, value]) => ({
        name,
        value: Math.round(value),
      })).sort((a, b) => b.value - a.value).slice(0, 8);

      const analysisResult: AnalysisResult = {
        metadata: {
          totalVideos: youtubeVideos.length,
          dateRange: 'Recent',
          learningRatio: features.learningRatio,
        },
        domains,
        skills,
        summary: `Your watch history shows ${enrichmentResult.topicClusters.join(', ')} interests with ${Math.round(features.learningRatio)}% educational content.`,
        recommendations: recommendations.map(rec => ({
          title: rec.title,
          matchScore: rec.matchScore,
          reason: rec.reason,
          skillsNeeded: rec.skillsNeeded,
          roadmapSteps: rec.roadmapSteps,
        })),
      };

      setAnalysisData(analysisResult);
      setAppState('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to process videos');
      setAppState('onboarding');
    }
  };

  const processVideoData = async (videos: VideoEntry[]) => {
    setAppState('processing');
    setError(null);
    try {
      const data = await analyzeWatchHistory(videos);
      setAnalysisData(data);
      setAppState('dashboard');
    } catch (err) {
      setError("We encountered an error analyzing your data. Please ensure the file is correct or try again.");
      setAppState('onboarding');
    }
  };

  const handleSignInWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.trim() === '') {
      setError('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file. For now, use "Upload Takeout File" or "Quick Demo" instead.');
      return;
    }
    oauthService.initiateOAuth();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const videos: VideoEntry[] = json.map((item: any) => ({
          title: item.title?.replace('Watched ', '') || 'Unknown Title',
          channelName: item.subtitles?.[0]?.name || 'Unknown Channel',
          time: item.time
        })).filter((v: any) => v.title !== 'Unknown Title');

        if (videos.length === 0) throw new Error("No videos found in file");
        await processVideoData(videos);
      } catch (err) {
        setError("Invalid watch-history.json format. Please use the original file from Google Takeout.");
      }
    };
    reader.readAsText(file);
  };

  const handleStartDemo = () => {
    processVideoData(MOCK_WATCH_HISTORY);
  };

  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900">CareerLens AI</h1>
        </div>
        
        <h2 className="text-5xl font-bold text-slate-900 leading-tight">
          Your watch history is a <span className="text-emerald-600">career signal</span>.
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          We process your YouTube data through an end-to-end NLP & Enrichment pipeline to find your professional calling.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={handleSignInWithGoogle}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!import.meta.env.VITE_GOOGLE_CLIENT_ID}
            title={!import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Google OAuth not configured. Use Upload Takeout File or Quick Demo instead.' : ''}
          >
            Sign in with Google
            <PlayCircle className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setAppState('onboarding')}
            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
          >
            Upload Takeout File
          </button>
          <button
            onClick={handleStartDemo}
            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
          >
            Quick Demo (Mock)
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
          <a href="https://joydrip.github.io/careerlens-ai/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors">
            Privacy Policy
          </a>
          <span className="text-slate-300">•</span>
          <a href="https://joydrip.github.io/careerlens-ai/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );

  const renderOnboarding = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100">
        <button onClick={() => setAppState('landing')} className="text-slate-400 hover:text-slate-600 text-sm mb-6 flex items-center gap-1">
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Acquisition Layer</h2>
        <p className="text-slate-600 mb-8">Choose your data source: Upload <strong>watch-history.json</strong> from Google Takeout, or use the <strong>Quick Demo</strong> with sample data.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1">OAuth Not Configured</p>
              <p>{error}</p>
              <p className="mt-2 text-xs text-amber-700">
                To enable "Sign in with Google", you need to set up Google OAuth credentials. See README.md for instructions.
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <button
              onClick={handleSignInWithGoogle}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google (Recommended)
            </button>
          )}
          
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 px-8 py-4 rounded-xl text-center">
              <p className="text-sm text-slate-600 mb-2">
                <strong>OAuth Not Configured:</strong> To use "Sign in with Google", you need to set up Google OAuth credentials.
              </p>
              <p className="text-xs text-slate-500">
                See README.md for setup instructions. Use "Upload Takeout File" below instead.
              </p>
            </div>
          )}

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <label className="block">
            <div className="w-full cursor-pointer flex flex-col items-center justify-center gap-4 bg-slate-50 border-2 border-dashed border-slate-300 p-12 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
              <FileJson className="w-12 h-12 text-slate-400 group-hover:text-emerald-500" />
              <div className="text-center">
                <span className="block font-bold text-slate-900">Choose File</span>
                <span className="text-xs text-slate-500">Only watch-history.json supported</span>
              </div>
              <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
            </div>
          </label>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Privacy & Consent
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed mb-2">
              We request access to your YouTube watch history (read-only) to provide career insights. By continuing, you consent to:
            </p>
            <ul className="text-xs text-blue-700 leading-relaxed list-disc list-inside space-y-1">
              <li>Processing your watch history data</li>
              <li>Storing analysis results (anonymized)</li>
              <li>Using data for career recommendations only</li>
            </ul>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">
                You can delete your data at any time from Settings.
              </p>
              <div className="flex gap-3">
                <a href="https://joydrip.github.io/careerlens-ai/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">
                  Privacy Policy
                </a>
                <a href="https://joydrip.github.io/careerlens-ai/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
          <div className="bg-white p-12 rounded-full shadow-xl border border-slate-100 relative">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Executing Enrichment Layer...</h2>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
              Gemini parsing skill taxonomy...
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
              Generating feature clusters...
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApp = () => (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">CareerLens</span>
        </div>

        <div className="px-4 py-2 border-b border-slate-100 space-y-1">
          <a
            href="https://joydrip.github.io/careerlens-ai/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3 h-3" />
            Privacy Policy
          </a>
          <a
            href="https://joydrip.github.io/careerlens-ai/terms-of-service.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <FileText className="w-3 h-3" />
            Terms of Service
          </a>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('careers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'careers' ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Target className="w-5 h-5" />
            Career Paths
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href="https://joydrip.github.io/careerlens-ai/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </a>
          <a
            href="https://joydrip.github.io/careerlens-ai/terms-of-service.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            Terms of Service
          </a>
          <button
            onClick={() => {
              setAppState('landing');
              setAnalysisData(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            New Analysis
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-xs text-slate-500">NLP Powered Career Assessment</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{userProfile?.name || 'Current Session'}</p>
              <p className="text-[10px] text-slate-500">{userProfile?.email || 'Data Enriched by Gemini'}</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && analysisData && <Dashboard data={analysisData} />}
          {activeTab === 'careers' && analysisData && <CareerRecommendations data={analysisData} />}
        </div>
      </main>
    </div>
  );

  return (
    <>
      {appState === 'landing' && renderLanding()}
      {appState === 'onboarding' && renderOnboarding()}
      {appState === 'processing' && renderProcessing()}
      {appState === 'dashboard' && renderApp()}
    </>
  );
};

export default App;

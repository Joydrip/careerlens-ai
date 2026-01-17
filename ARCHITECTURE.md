# CareerLens AI - Architecture Documentation

## System Architecture Overview

CareerLens AI is an end-to-end ML-powered career recommendation system that analyzes YouTube watch history. The architecture follows a 14-layer design pattern.

## Layer-by-Layer Implementation

### 1. User Onboarding & Consent Layer ✅

**Location:** `services/oauthService.ts`, `App.tsx`

**Components:**
- Google OAuth 2.0 authentication
- OAuth state verification (CSRF protection)
- Consent screen integration
- User profile retrieval

**Permissions Requested:**
- `https://www.googleapis.com/auth/youtube.readonly` - YouTube watch history access
- `https://www.googleapis.com/auth/userinfo.profile` - User profile
- `https://www.googleapis.com/auth/userinfo.email` - User email

### 2. Data Acquisition Layer ✅

**Location:** `services/youtubeDataService.ts`

**Features:**
- YouTube Data API v3 integration
- Activities.list endpoint with `mine=true`
- Video metadata enrichment
- Pagination support
- Error handling for API limits

**Endpoints Used:**
- `/activities` - Fetch user activities
- `/videos` - Get detailed video metadata

### 3. Data Storage Layer ✅

**Location:** `types/database.ts`

**Schema Design:**
- `User` - User accounts and authentication
- `WatchHistoryRaw` - Raw YouTube watch data
- `VideoMetadata` - Enriched video information
- `AnalysisFeatures` - Processed feature vectors
- `CareerScores` - Recommendation results
- `UserSession` - Session management (Redis)

**Storage Strategy:**
- PostgreSQL/MongoDB for persistent data
- Redis for session management
- Encrypted at rest

### 4. Data Enrichment Layer ✅

**Location:** `services/enrichmentService.ts`

**Enrichment Features:**
- YouTube category mapping (15 categories)
- Skill keyword extraction (6 skill domains)
- Topic cluster identification
- Educational content detection
- Learning level assessment (beginner/intermediate/advanced)

**Skill Taxonomy:**
- Programming (Python, JavaScript, React, etc.)
- Data Science (ML, AI, Statistics, etc.)
- Design (Figma, UI/UX, etc.)
- Marketing (SEO, Social Media, etc.)
- Business (Entrepreneurship, Finance, etc.)
- DevOps (Docker, Kubernetes, AWS, etc.)

### 5. Feature Engineering Layer ✅

**Location:** `services/featureEngineeringService.ts`

**Features Generated:**
- Category percentages (normalized to 0-100)
- Skill scores (weighted frequency)
- Topic cluster distribution
- Learning ratio (educational vs entertainment)
- Learning level ratios
- Watch frequency per week
- ML-ready feature vector (38 dimensions)

**ML Feature Vector Composition:**
- 10 category features
- 10 skill features
- 3 topic cluster features
- 2 learning ratio features
- 3 learning level features

### 6. Visualization & Analytics Layer ✅

**Location:** `components/Dashboard.tsx`

**Charts & Visualizations:**
- Category distribution bar chart
- Skill taxonomy pie chart
- Stat cards (Learning ratio, Video count, etc.)
- NLP summary display

**Technologies:**
- Recharts for charts
- Tailwind CSS for styling

### 7. Career Recommendation Engine ✅

**Location:** `services/careerRecommendationService.ts`

**Career Knowledge Base:**
- 6 predefined career paths:
  - Data Scientist
  - Software Engineer
  - UX/UI Designer
  - Product Manager
  - ML Engineer
  - Digital Marketer

**Scoring Algorithm:**
- Weighted skill matching
- Category-based scoring
- Normalized to 0-100 scale
- Cosine similarity ready

### 8. Explainability Layer ✅

**Location:** `services/careerRecommendationService.ts` (buildRecommendation method)

**Explainability Features:**
- Contributing factor identification
- Skill inference explanation
- Missing skill analysis
- Human-readable reasoning

**Example Output:**
```
"Your watch history shows strong alignment with Data Scientist. 
You consistently watch content related to Data Science, Programming. 
Your high learning-focused viewing pattern (75%) indicates serious 
interest in skill development."
```

### 9. Recommendation Output Layer ✅

**Location:** `components/CareerRecommendations.tsx`

**Output Components:**
- Top 3 career matches with scores
- Match reasoning
- Contributing factors
- Skills inferred from history
- Missing skills to learn
- 5-step learning roadmap

### 10. Frontend Architecture ✅

**Location:** `App.tsx`, `components/`

**Tech Stack:**
- React 19 + TypeScript
- Tailwind CSS
- Recharts
- Lucide React icons

**Components:**
- `App.tsx` - Main application with state management
- `Dashboard.tsx` - Analytics visualization
- `CareerRecommendations.tsx` - Career match display
- `PrivacySettings.tsx` - GDPR compliance UI

**State Management:**
- React hooks (useState, useEffect)
- Local storage for tokens
- Session storage for OAuth state

### 11. Backend Architecture ✅

**Location:** `backend/server.js`

**Tech Stack:**
- Express.js
- Google APIs Client Library
- CORS enabled
- Environment-based configuration

**API Endpoints:**
- `POST /api/auth/oauth/callback` - OAuth token exchange
- `POST /api/auth/refresh` - Token refresh
- `POST /api/process/watch-history` - Process watch history
- `POST /api/recommendations/careers` - Get recommendations
- `DELETE /api/user/data` - Delete user data (GDPR)

### 12. Security, Privacy & Compliance ✅

**Location:** `components/PrivacySettings.tsx`, `backend/server.js`

**Security Features:**
- OAuth 2.0 state verification
- Encrypted data storage
- HTTPS enforcement (production)
- Token refresh mechanism

**Privacy Features:**
- GDPR-compliant data deletion
- Data export functionality
- Explicit consent flow
- No data resale policy
- Privacy policy integration

### 13. Deployment & Scaling

**Deployment Strategy:**
- Frontend: Vercel/Netlify (static hosting)
- Backend: AWS/GCP (containerized)
- Database: Managed PostgreSQL
- Session Store: Redis Cloud
- ML Services: Docker containers

**Scaling Considerations:**
- Horizontal scaling for API
- Database connection pooling
- CDN for static assets
- Queue system for batch processing

### 14. High-Level Architecture Flow

```
User → Web App (React)
  ↓
OAuth 2.0 (Google)
  ↓
YouTube Data API (activities.list)
  ↓
Backend API (Express.js)
  ↓
Data Enrichment Service
  ↓
Feature Engineering Service
  ↓
Career Recommendation Engine
  ↓
Explainability Layer
  ↓
Charts & Insights Dashboard (React)
```

## Data Flow

1. **Authentication:** User signs in with Google → OAuth tokens stored
2. **Data Fetching:** YouTube API called → Raw watch history retrieved
3. **Enrichment:** Videos processed → Categories, skills, topics extracted
4. **Feature Engineering:** Features normalized → ML-ready vectors created
5. **Recommendation:** Features matched → Career scores calculated
6. **Visualization:** Results displayed → Interactive charts rendered

## Environment Variables

### Frontend (.env)
```
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_key
```

### Backend (backend/.env)
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## Testing Recommendations

1. **Unit Tests:** Each service layer
2. **Integration Tests:** API endpoints
3. **E2E Tests:** OAuth flow and recommendation pipeline
4. **Load Tests:** API performance under load

## Future Enhancements

- [ ] Database persistence layer
- [ ] ML model training pipeline
- [ ] Real-time recommendation updates
- [ ] Advanced visualizations (D3.js)
- [ ] Course/certification suggestions API
- [ ] Community features
- [ ] Multi-language support

## Performance Optimization

- Video metadata batch fetching
- Feature vector caching
- Recommendation result caching
- Lazy loading for charts
- Code splitting for React components

# CareerLens AI - End-to-End Career Recommendation System

A comprehensive ML-powered career recommendation platform that analyzes YouTube watch history to provide personalized career insights.

## 🏗️ Architecture Overview

This project implements a complete 14-layer architecture:

### 1. User Onboarding & Consent Layer
- Google OAuth 2.0 authentication
- Explicit consent for YouTube Data API access
- Privacy-first design

### 2. Data Acquisition Layer
- YouTube Data API v3 integration
- Real-time watch history fetching
- Google Takeout fallback support

### 3. Data Storage Layer
- PostgreSQL/MongoDB for structured data
- Redis for session management
- Encrypted data at rest

### 4. Data Enrichment Layer
- NLP processing with Gemini AI
- Video category classification
- Skill taxonomy extraction

### 5. Feature Engineering Layer
- Category distribution analysis
- Skill frequency scoring
- Topic clustering
- Learning ratio calculation

### 6. Visualization & Analytics Layer
- Interactive dashboards with Recharts
- Category distribution charts
- Skill heatmaps
- Time-series trends

### 7. Career Recommendation Engine
- Knowledge base with 6+ career paths
- Weighted scoring algorithm
- Cosine similarity matching
- ML-enhanced recommendations

### 8. Explainability Layer
- Transparent recommendation reasoning
- Contributing factor analysis
- Skill gap identification

### 9. Recommendation Output Layer
- Top 3 career matches
- Skill gap analysis
- Learning roadmaps
- Actionable next steps

### 10. Frontend Architecture
- React + TypeScript
- Tailwind CSS
- Recharts for visualizations
- OAuth UI components

### 11. Backend Architecture
- Express.js API server
- OAuth token handling
- Data processing services
- RESTful endpoints

### 12. Security & Privacy
- GDPR-compliant data handling
- Data deletion capabilities
- Encryption at rest & transit
- No data resale policy

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Platform account
- YouTube Data API v3 enabled

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd careerlens-ai
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Set up environment variables**

Create `.env` in the root:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_api_key
```

Create `.env` in `backend/`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
FRONTEND_URL=http://localhost:3000
PORT=5000
```

5. **Run the development servers**

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## 📁 Project Structure

```
careerlens-ai/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── CareerRecommendations.tsx
│   └── PrivacySettings.tsx
├── services/           # Business logic services
│   ├── oauthService.ts
│   ├── youtubeDataService.ts
│   ├── enrichmentService.ts
│   ├── featureEngineeringService.ts
│   ├── careerRecommendationService.ts
│   └── geminiService.ts
├── types/             # TypeScript definitions
│   ├── database.ts
│   └── types.ts
├── backend/           # Express.js backend
│   ├── server.js
│   └── package.json
└── App.tsx           # Main application component
```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/callback`
6. Copy Client ID and Client Secret

## 📊 Features

### Real-time Data Processing
- Direct YouTube API integration
- No manual file uploads required
- Automatic watch history fetching

### Advanced Analytics
- Category distribution analysis
- Skill frequency scoring
- Learning vs entertainment ratio
- Topic clustering

### Career Matching
- 6+ predefined career paths
- Weighted scoring algorithm
- Explainable recommendations
- Skill gap analysis

### Privacy First
- GDPR-compliant data handling
- One-click data deletion
- Data export capabilities
- Encrypted storage

## 🛠️ Tech Stack

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Vite

**Backend:**
- Express.js
- Google APIs Client
- Node.js

**AI/ML:**
- Google Gemini 3 Pro
- Custom feature engineering
- Career knowledge base

## 📝 API Endpoints

### Authentication
- `POST /api/auth/oauth/callback` - Exchange OAuth code for tokens
- `POST /api/auth/refresh` - Refresh access token

### Data Processing
- `POST /api/process/watch-history` - Process watch history
- `POST /api/recommendations/careers` - Get career recommendations

### Privacy
- `DELETE /api/user/data` - Delete user data

## 🔒 Security Considerations

- OAuth 2.0 state verification
- HTTPS in production
- Encrypted data storage
- Token refresh mechanism
- GDPR compliance

## 📈 Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] ML model training pipeline
- [ ] Real-time recommendation updates
- [ ] Multi-language support
- [ ] Advanced visualizations (D3.js)
- [ ] Course/certification suggestions
- [ ] Community features

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or issues, please open a GitHub issue.

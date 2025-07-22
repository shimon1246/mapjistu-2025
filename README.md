# 🗺️ MapJitsu - AI-Powered Location Intelligence

**Context-aware navigation platform that surfaces trust, safety, digital hygiene, and public reputation signals about real-world locations.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-green)](https://www.mapbox.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-brightgreen)](https://vercel.com/)

## ✨ Features

### Phase 1 (Current)
- 🗺️ **Interactive Map Interface** - Powered by Mapbox GL JS
- 🔍 **Location Search** - Find any address or business
- 📊 **Color-Coded Safety Scoring** - Visual indicators (Green/Blue/Yellow/Red)
- 📱 **Mobile Responsive** - Optimized for all devices
- 🎯 **Click-to-Explore** - Detailed breakdowns for each location
- 📈 **Category Analysis** - Safety, Hygiene, Reputation, Trust scores

### Coming Soon (Phase 2+)
- 🤖 **AI-Powered Analysis** - Claude 4 + GPT-4 integration
- 📈 **Real-Time Data Pipelines** - Live updates from multiple sources
- 👤 **User Authentication** - Personal profiles and saved locations
- 🔄 **Contextual Reputation Score (CRS)** - Dynamic scoring algorithm
- 📊 **Analytics Dashboard** - Detailed insights and trends

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 + TypeScript
- Tailwind CSS + Custom Components
- Mapbox GL JS
- React Hooks & Context

**Backend (Phase 2+):**
- Next.js API Routes
- Neon PostgreSQL + Prisma ORM
- Redis Caching
- Python FastAPI (AI/ML services)

**AI/ML (Phase 2+):**
- Anthropic Claude 4
- OpenAI GPT-4
- Model Context Protocol (MCP)
- spaCy + Hugging Face Transformers

**Infrastructure:**
- Vercel (Frontend)
- GCP Cloud Run (Backend)
- GitHub Actions (CI/CD)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Mapbox account and API token

### Installation

```bash
# Clone the repository
git clone https://github.com/shimon1246/mapjitsu.git
cd mapjitsu

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local

# Add your Mapbox token to .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see MapJitsu in action.

## 🎯 How to Use

1. **Search for a location** using the search bar
2. **Explore the map** - colored markers indicate safety scores
3. **Click any marker** to view detailed category breakdowns
4. **View insights** in the sidebar for Safety, Hygiene, Reputation, and Trust

## 📊 Scoring System

| Score Range | Color | Status | Description |
|-------------|-------|---------|-------------|
| 8.5+ | 🟢 Green | Excellent | Highly recommended |
| 7.0-8.4 | 🔵 Blue | Good | Generally safe |
| 5.5-6.9 | 🟡 Yellow | Fair | Exercise caution |
| <5.5 | 🔴 Red | Caution | Potential concerns |

## 🗺️ Development Roadmap

- [x] **Phase 1:** Frontend map with location search ✅
- [ ] **Phase 2:** Data pipelines and NLP scoring
- [ ] **Phase 3:** CRS publishing + interactive dashboard  
- [ ] **Phase 4:** Auth, user favorites, caching
- [ ] **Phase 5:** Testing, observability, compliance
- [ ] **Phase 6:** Launch & iterate

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo:** [MapJitsu App](https://mapjitsu.vercel.app)
- **Repository:** [GitHub](https://github.com/shimon1246/mapjitsu)
- **Documentation:** [Wiki](https://github.com/shimon1246/mapjitsu/wiki)

## 📧 Contact

**Project Maintainer:** [@shimon1246](https://github.com/shimon1246)

---

**MapJitsu** - Making the world more transparent, one location at a time. 🌍✨

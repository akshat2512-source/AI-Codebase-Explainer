# 🧠 AI Codebase Explainer

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Analyze any GitHub repository instantly.** Get AI-powered explanations of architecture, tech stack, file structure, and setup instructions — all from a single URL.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Repository Analysis** | Fetch metadata, stats, languages, topics, and more from any public GitHub repo |
| 🌳 **File Explorer** | Interactive, collapsible file tree with syntax-aware icons |
| 🛠️ **Tech Stack Detection** | Automatically identifies languages, frameworks, databases, and DevOps tools |
| 🤖 **AI Explanation** | Generates comprehensive codebase overviews, architecture summaries, and setup guides |
| 📊 **Architecture Diagrams** | Auto-generated Mermaid.js diagrams visualizing system components |
| 💬 **Repository Chat** | Ask questions about any repo and get AI-powered contextual answers |
| 📄 **PDF Export** | Download detailed analysis reports as professionally formatted PDFs |
| 🔗 **Shareable Links** | Generate unique URLs to share analysis results with anyone |
| 📚 **Analysis History** | Save, view, and manage past analyses from your dashboard |
| 🔐 **Authentication** | JWT-based user registration and login |

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Lucide Icons, Mermaid.js |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB (local or Atlas) |
| **AI** | OpenAI GPT API (with mock fallback) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Export** | PDFKit |
| **APIs** | GitHub REST API |

---

## 📁 Project Structure

```
ai-codebase-explainer/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API service functions
│   │   └── utils/              # Utility helpers
│   ├── .env.example
│   └── vite.config.js
├── server/                     # Express backend
│   ├── config/                 # Database config
│   ├── controllers/            # Route controllers
│   ├── middlewares/             # Auth, error, cache middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic (AI, GitHub, etc.)
│   ├── utils/                  # Token generation, helpers
│   ├── .env.example
│   └── server.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) URI
- **OpenAI API Key** (optional — the app falls back to mock responses)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-codebase-explainer.git
cd ai-codebase-explainer
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and OPENAI_API_KEY
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
# The default .env works for local development (uses Vite proxy)
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

---

## 🌐 Deployment

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your repository, set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables in Render dashboard:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...your-atlas-uri...
   JWT_SECRET=your_production_secret
   OPENAI_API_KEY=sk-...
   CLIENT_URL=https://your-app.vercel.app
   ```

### Frontend → Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your repository, set:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` for cloud deployment access
3. Copy the connection string and set it as `MONGO_URI` in your backend env

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |
| `POST` | `/api/repos/analyze` | Analyze a GitHub repo (metadata) | No |
| `POST` | `/api/repos/tree` | Fetch repo file tree | No |
| `POST` | `/api/repos/tech-stack` | Detect tech stack | No |
| `POST` | `/api/repos/ai-analysis` | Generate AI explanation | No |
| `POST` | `/api/repos/architecture` | Generate architecture diagram | No |
| `POST` | `/api/chat/repo` | Chat with a repository | No |
| `GET` | `/api/analysis` | List user analyses | Yes |
| `POST` | `/api/analysis` | Save analysis | Yes |
| `DELETE` | `/api/analysis/:id` | Delete analysis | Yes |
| `GET` | `/api/report/:id` | Download PDF report | Yes |
| `GET` | `/api/share/:shareId` | Get shared analysis | No |
| `GET` | `/api/health` | Health check | No |

---

## 🖼️ Screenshots

> *Add screenshots of your deployed application here.*

| Landing Page | Analyzer | Dashboard |
|---|---|---|
| ![Landing](#) | ![Analyzer](#) | ![Dashboard](#) |

---

## 🔗 Deployment Links

| | URL |
|---|---|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend** | `https://your-api.onrender.com` |

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <b>Built with ❤️ using the MERN Stack + AI</b>
</p>

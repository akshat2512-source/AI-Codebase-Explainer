# AI Codebase Explainer

AI Codebase Explainer is a production-ready, full-stack MERN application that analyzes GitHub repositories and automatically generates clear explanations of the architecture, folder structure, tech stack, and setup instructions.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router DOM, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), CORS, Dotenv

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via MongoDB Atlas)

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-codebase-explainer
```

### 2. Setup the Backend
Open a new terminal and navigate to the `server` directory.

```bash
cd server
npm install
```

Configure your `.env` file in the `server` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-codebase-explainer
```

Start the backend server:
```bash
# For development with nodemon
npm run dev

# For production
npm start
```
The backend server will run on `http://localhost:5000`.

### 3. Setup the Frontend
Open another terminal and navigate to the `client` directory.

```bash
cd client
npm install
```

Start the React development server:
```bash
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

## Architecture
This project follows a modular system:
- **/server**: REST API powered by Node & Express, handling AI evaluation logic (placeholder for now) and database connections.
- **/client**: A responsive and modern user interface built with React, Vite, and Tailwind CSS.

## Features
- **Landing Page**: Input any GitHub repository URL for analysis.
- **Dashboard**: View recent analysis history and global repository statistics.
- **Analyzer View**: See dynamic output summarizing the repository's tech stack, folder structure, and architecture.

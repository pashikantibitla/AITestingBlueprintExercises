# Intelligent Test Plan Agent

AI-powered test plan generator that integrates JIRA tickets with LLM analysis.

## Features

- 🔗 **JIRA Integration**: Fetch ticket details directly from JIRA
- 🤖 **LLM Support**: Use Groq (cloud) or Ollama (local) for test plan generation
- 📄 **Template-based**: Upload PDF templates or use the default
- 💾 **History**: Save and retrieve previously generated test plans
- 🔒 **Secure**: API keys stored securely in backend

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **LLM**: Groq API or Ollama (local)

## Quick Start

### Prerequisites

- Node.js 18+
- JIRA API Token
- Groq API Key (optional, for cloud LLM)
- Ollama (optional, for local LLM)

### Installation

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. Copy `.env.example` to `.env` in the backend folder
2. Fill in your credentials:
   - JIRA_BASE_URL
   - JIRA_USERNAME
   - JIRA_API_TOKEN
   - GROQ_API_KEY (optional)

### Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## Usage

1. **Settings**: Configure JIRA and LLM credentials
2. **Generate**: Enter a JIRA ticket ID (e.g., ENG-123)
3. **Review**: Check fetched ticket details
4. **Generate**: Click "Generate Test Plan"
5. **Export**: Copy or download as Markdown

## File Structure

```
TestPlanAgent/
├── backend/
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Database & logic
│   │   └── index.js      # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Dashboard, Settings, History
│   │   └── services/     # API client
│   └── package.json
└── README.md
```

## License

MIT

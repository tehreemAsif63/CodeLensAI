# CodeLens AI

A lightweight code-understanding app for demos and learning. Paste code, select mode (explain/teach/quiz/structure) and depth (quick/medium/deep), and get instant analysis.

**Status**: Works locally without API keys. Uses local fallback engine. Real LLM integration coming soon.

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Spring Boot (Java)
- API: REST (`POST /analyze`)
- CI/CD: GitHub Actions (tests + Pages deployment)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│              Port 5173 | http://localhost:5173           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Editor + Mode/Depth Selectors + Response Panel    │  │
│  └──────────────────────┬─────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │ POST /analyze (JSON)
                          ▼
        ┌─────────────────────────────────────┐
        │   Backend (Spring Boot)              │
        │ Port 8080 | http://localhost:8080    │
        │ ┌──────────────────────────────────┐ │
        │ │ AnalyzeController                │ │
        │ │ ├─ POST /analyze endpoint        │ │
        │ └──────────────┬────────────────────┘ │
        │                │                       │
        │ ┌──────────────▼────────────────────┐ │
        │ │ AiService                        │ │
        │ │ ├─ Real LLM (future)             │ │
        │ │ └─ Local Fallback (current)      │ │
        │ └──────────────────────────────────┘ │
        └─────────────────────────────────────┘
                          │ Plain text response
                          ▼
        ┌─────────────────────────────────────┐
        │     GitHub Actions (CI/CD)           │
        │ ├─ Backend: Maven tests on push      │
        │ └─ Frontend: Build & deploy to Pages │
        └─────────────────────────────────────┘
```

## How it works

1. User enters code in the frontend editor
2. User selects mode and depth
3. Frontend sends `POST /analyze` request to backend
4. Backend `AiService` processes and returns plain text response
5. Frontend receives response and displays it in the response panel

## Run locally

Prerequisites:

- JDK 19
- Node.js + npm

Start backend (port 8080):

```bash
cd backend
mvn spring-boot:run
```

Start frontend (port 5173):

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## CI/CD Pipeline

GitHub Actions automatically:

- **Backend**: Runs Maven tests on every push to `main` or `develop`
- **Frontend**: Builds and deploys to GitHub Pages on `main`

## Roadmap

- Real LLM integration (OpenAI or other providers)
- Provider abstraction to support multiple AI engines
- Dynamic quiz/structure generation from model output

# CodeLens AI

CodeLens AI is a lightweight code-understanding app for demos and learning.

Paste code, choose a mode, choose depth, and get a response from a local backend fallback engine.

## Current status (truthful)

What works today:

- Frontend + backend run locally without any API key.
- Modes:
  - `explain`
  - `teach`
  - `quiz`
  - `structure`
- Depth levels:
  - `quick`
  - `medium`
  - `deep`
- Quiz and structure have hard-coded preview experiences in the UI.
- `Show preview` toggle is available for quiz/structure modes.
- Response panel supports `Copy`.
- Editor has `Clear` and character count.

What is not live yet:

- Real LLM generation is not integrated yet.
- Even when `OPENAI_API_KEY` exists, backend currently still returns local fallback responses via placeholder routing.

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Spring Boot (Java)
- API: REST (`POST /analyze`)

## How it works right now

1. User pastes code in the frontend.
2. User selects mode and depth.
3. Frontend sends request to `POST /analyze`.
4. Backend `AiService` uses local mode/depth-aware fallback logic.
5. Response is rendered in the UI.

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

## API contract

Endpoint:

- `POST /analyze`

Request body:

```json
{
  "code": "...",
  "mode": "explain | teach | quiz | structure",
  "depth": "quick | medium | deep"
}
```

Response:

- Plain text (`text/plain`)

## Roadmap (planned)

Planned next steps:

1. Replace placeholder path with real OpenAI (or other provider) integration.
2. Add provider abstraction to support multiple AI agents/providers.
3. Keep local fallback as safe default when keys/providers are unavailable.
4. Generate quiz/structure previews dynamically from model output.

## Project principle

Keep it simple, demoable, and honest about what is live versus planned.

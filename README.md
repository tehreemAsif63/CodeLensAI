# CodeLens AI

CodeLens AI is a full-stack learning tool that helps users understand code faster.

Users paste code, choose a mode and depth, and receive a clear AI-generated response.

## Project Goal

Make code understanding easier for students, beginners, and developers by turning raw snippets into readable explanations, guided teaching, and quiz-based learning.

## What It Does

- 4 learning modes: `explain`, `teach`, `quiz`, `structure`
- 3 depth levels: `quick`, `medium`, `deep`
- Markdown rendering for clean, readable output
- Quiz mode with scoring feedback

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Spring Boot (Java 19)
- AI Provider: Mistral Chat Completions API

## High-Level Architecture

```text
User Browser (Frontend)
	|
	v
React App (UI + input state)
	|
	v
Spring Boot API (request validation + prompt building)
	|
	v
Mistral API (AI response)
	|
	v
Spring Boot API (returns plain text)
	|
	v
React App (renders response/quiz)
```

## User Journey

```text
Paste code -> Select mode/depth -> Click Analyze -> Review response
						|
						+-> If quiz mode: Answer -> Submit -> View score
```

## Runtime Notes

- Response type: plain text
- Requires `MISTRAL_API_KEY`
- Missing key returns `503 Service Unavailable`
- Invalid request data returns `400`
- Provider/network failures return `502`

## Run Locally

Prerequisites:

- Java 19
- Node.js + npm

1. Create a local backend `.env` file:

```bash
cd backend
cat > .env <<EOF
MISTRAL_API_KEY=your_key_here
EOF
```

2. Load the `.env` values into your shell and start backend:

```bash
cd backend
set -a
source .env
set +a
mvn spring-boot:run
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Open the frontend URL shown by Vite.

## Environment Variable

The backend needs this variable:

```bash
MISTRAL_API_KEY=your_key_here
```

If the key is missing, the backend returns `503 Service Unavailable`.

# 🧠 CodeLens AI

> Reading code should not feel like decoding ancient scrolls.

---

## 🚀 What this is

CodeLens AI helps you understand code faster.

Paste code → get explanations, concepts, structure, or quizzes.

It turns complex code into something readable and learnable.

---

## ✨ Features

- 📖 Explain code (simple → deep)
- 🧠 Teach concepts behind code
- 🧪 Quiz mode
- 🧩 Structure view
- ⚡ Depth control

---

## 🧱 Tech Stack

- React (Vite + TypeScript)
- Spring Boot
- REST API
- GitHub Models API (`gpt-4o-mini`)

---

## 🧭 How it works

1. Paste code
2. Select mode
3. Backend builds prompt
4. AI responds
5. UI displays result

---

## Run locally

You need **two terminals**: backend first, then frontend.

**Prerequisites:** JDK **19**, **Node.js** (with npm).

### GitHub Models setup

1. **Create a token**
   - Go to GitHub **Settings** → **Developer settings** → **Personal access tokens**.
   - Create a token that can access GitHub Models (per your org/account policy).
2. **Put it in `.env`**
   - Create `.env` in the project root:
   - `GITHUB_TOKEN=your_token_here`
3. **Load env before running backend**
   - `export $(grep -v '^#' .env | xargs)`

**1. Backend (Spring Boot, port 8080)**

```bash
cd backend
mvn spring-boot:run
```

**2. Frontend (Vite, port 5173)**

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in the browser. The UI calls the API at **http://localhost:8080**.

---

## ⚠️ Principle

Single page. Single API. Keep it simple.

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
- Hybrid AI fallback with optional future OpenAI support

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

### AI mode

The backend checks `OPENAI_API_KEY`.

- If the key is missing or empty, it uses a built-in local fake AI response system.
- If the key is present, the code is already structured for a future OpenAI integration point.

No API key is required to run the app today.

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

# 🧠 CodeLens AI

> Reading code should not feel like decoding ancient scrolls.

---

## 🚀 What this is

CodeLens AI helps you understand code faster and more clearly.

Paste any code.  
Get explanations, concepts, structure, or quizzes instantly.

It turns complex or messy code into something readable and learnable.

---

## ✨ Features

- 📖 Explain code (simple → deep)
- 🧠 Teach mode (concept breakdown)
- 🧪 Quiz mode (test your understanding)
- 🧩 Structure view (how parts connect)
- ⚡ Adjustable explanation depth

---

## 👤 Who this is for

- Developers learning fullstack development
- People reading unfamiliar or legacy code
- Anyone who wants faster code understanding

---

## 🎯 What it helps with

- Understanding code quickly
- Learning underlying concepts (React, async/await, Spring, etc.)
- Adjusting explanation depth
- Generating quizzes from code
- Understanding system structure

---

## 🚫 Non-goals

This project intentionally avoids:

- Authentication systems
- CI/CD pipelines
- Databases or complex persistence
- Multi-page architecture
- Advanced diagram rendering

👉 Goal: **simple single-page + single API system**

---

## 🧱 Tech Stack

- React (Vite + TypeScript)
- Spring Boot
- REST API
- Gemini API (AI engine)
- Tailwind (optional)

---

## 🧭 How it works

1. User pastes code
2. User selects mode (Explain / Teach / Quiz / Structure)
3. Backend builds a prompt based on mode + depth
4. AI returns structured response
5. UI displays result

---

## 🔁 Build Flow (MVP-first approach)

1. Backend: `/analyze` returns dummy response
2. Frontend: UI sends request and displays response
3. Backend: integrate AI (Gemini)
4. Add modes (explain / teach / quiz / structure)
5. Improve UI (optional polish)

Rule: Always keep something working.

---

## ⚠️ Key Rule

Never build frontend or backend in isolation.

Always iterate:

> small backend change → frontend test → adjust → repeat

---

## 🧠 Philosophy

CodeLens AI exists for one reason:

> Understanding code should be faster than writing it.

It does not replace thinking.  
It removes friction.

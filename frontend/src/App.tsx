import { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080";

type Mode = "explain" | "teach" | "quiz" | "structure";

export default function App() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [responseText, setResponseText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!code.trim()) {
      setErrorText(
        "Paste some code first so the fallback assistant has something useful to work with.",
      );
      setResponseText("");
      return;
    }

    setLoading(true);
    setResponseText("");
    setErrorText("");

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode, depth: "shallow" }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(
          message || "The assistant hit a snag. Please try again in a moment.",
        );
      }

      const raw = await res.text();
      setResponseText(raw || "No response was returned.");
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Could not reach the backend. The fallback assistant is still here when it comes back.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="app-card">
        <section className="hero">
          <p className="eyebrow">CodeLens AI</p>
          <h1>Paste code, pick a mode, and get a clearer answer.</h1>
          <p className="hero-copy">
            A simple workspace for code explanations, concept help, quick
            quizzes, and architecture flow.
          </p>
          <p className="fallback-note">
            Local fallback mode is on: no real AI key required, just a helpful
            best-effort assistant that keeps the work moving.
          </p>
        </section>

        <div className="content-grid">
          <form
            className="panel editor-panel"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <label className="field">
              <span className="field-label">Code</span>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                placeholder="Paste your code here..."
              />
            </label>

            <div className="field-row">
              <label className="field mode-field">
                <span className="field-label">Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  <option value="explain">Explain</option>
                  <option value="teach">Teach</option>
                  <option value="quiz">Quiz</option>
                  <option value="structure">Structure</option>
                </select>
              </label>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Analyzing…" : "Analyze"}
              </button>
            </div>

            {loading ? (
              <p className="status loading">
                Working on it... the local assistant is putting together a
                best-effort answer.
              </p>
            ) : null}
            {errorText ? <p className="status error">{errorText}</p> : null}
          </form>

          <section className="panel response-panel" aria-live="polite">
            <div className="panel-header">
              <h2>Response</h2>
            </div>
            <pre
              className={responseText ? "response-text" : "response-text empty"}
            >
              {responseText ||
                "Your answer will appear here. The fallback assistant is ready when you are."}
            </pre>
          </section>
        </div>
      </main>
    </div>
  );
}

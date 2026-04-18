import { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080";

type Mode = "explain" | "teach" | "quiz" | "structure";

type Depth = "quick" | "medium" | "deep";

export default function App() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [depth, setDepth] = useState<Depth>("medium");
  const [responseText, setResponseText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const loadingLabel =
    mode === "quiz"
      ? "Generating quiz response"
      : mode === "structure"
        ? "Generating architecture response"
        : "Generating AI response";

  async function handleSubmit() {
    if (!code.trim()) {
      setErrorText("Paste some code to get started.");
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
        body: JSON.stringify({ code, mode, depth }),
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
          : "Could not reach the backend. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (responseText) {
      navigator.clipboard.writeText(responseText);
    }
  }

  function clearCode() {
    setCode("");
    setResponseText("");
    setErrorText("");
  }

  return (
    <div className="app-shell">
      <main className="app-card">
        <section className="hero">
          <h1 className="app-title">CodeLens AI</h1>
          <p className="hero-copy">
            Paste code, pick a mode, and get a clear answer.
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
              <button
                type="button"
                className="clear-button"
                onClick={clearCode}
                title="Clear code and response"
              >
                Clear
              </button>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                placeholder="Paste your code here..."
              />
              <div className="char-count">{code.length} characters</div>
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
                  <option value="structure">Explain architecture flow</option>
                </select>
              </label>

              <fieldset className="depth-field">
                <legend className="field-label">Depth</legend>
                <div className="depth-options">
                  <label>
                    <input
                      type="radio"
                      name="depth"
                      value="quick"
                      checked={depth === "quick"}
                      onChange={(e) => setDepth(e.target.value as Depth)}
                    />
                    Quick
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="depth"
                      value="medium"
                      checked={depth === "medium"}
                      onChange={(e) => setDepth(e.target.value as Depth)}
                    />
                    Medium
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="depth"
                      value="deep"
                      checked={depth === "deep"}
                      onChange={(e) => setDepth(e.target.value as Depth)}
                    />
                    Deep
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            {loading ? (
              <p className="status loading">Analyzing your code...</p>
            ) : null}
            {errorText ? <p className="status error">{errorText}</p> : null}
          </form>

          <section className="panel response-panel" aria-live="polite">
            <div className="panel-header">
              <h2>Response</h2>
              {loading ? (
                <div className="loading-chip" role="status" aria-live="polite">
                  <span className="loading-spinner" aria-hidden="true" />
                  <span>{loadingLabel}</span>
                </div>
              ) : null}
              {responseText && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              )}
            </div>

            {loading ? (
              <div
                className="response-loading"
                role="status"
                aria-live="polite"
              >
                <div className="response-loading-title">
                  <span className="loading-spinner" aria-hidden="true" />
                  <strong>{loadingLabel}...</strong>
                </div>
                <p>Analyzing your code and preparing a helpful answer.</p>
                <div className="loading-bar" aria-hidden="true">
                  <span />
                </div>
              </div>
            ) : (
              <pre
                className={
                  responseText ? "response-text" : "response-text empty"
                }
              >
                {responseText || "Your answer will appear here."}
              </pre>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

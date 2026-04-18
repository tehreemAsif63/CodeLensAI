import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const API_BASE = "http://localhost:8080";

type Mode = "explain" | "teach" | "quiz" | "structure";

type Depth = "quick" | "medium" | "deep";

type QuizQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

function extractJsonBlock(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }
  return raw.trim();
}

function parseQuizQuestions(raw: string): QuizQuestion[] | null {
  try {
    const parsed = JSON.parse(extractJsonBlock(raw));
    const questions = Array.isArray(parsed?.questions)
      ? parsed.questions
      : null;

    if (!questions || questions.length === 0) {
      return null;
    }

    const normalized = questions
      .map((q: unknown) => {
        const question = q as Record<string, unknown>;
        const promptValue =
          typeof question.question === "string"
            ? question.question
            : typeof question.prompt === "string"
              ? question.prompt
              : "";
        const optionsValue = Array.isArray(question.options)
          ? question.options.filter(
              (opt): opt is string => typeof opt === "string",
            )
          : [];
        const answerIndexValue =
          typeof question.answerIndex === "number"
            ? question.answerIndex
            : typeof question.correctOption === "number"
              ? question.correctOption
              : -1;
        const explanationValue =
          typeof question.explanation === "string"
            ? question.explanation
            : undefined;

        if (!promptValue || optionsValue.length < 2) {
          return null;
        }

        if (answerIndexValue < 0 || answerIndexValue >= optionsValue.length) {
          return null;
        }

        return {
          prompt: promptValue,
          options: optionsValue,
          answerIndex: answerIndexValue,
          explanation: explanationValue,
        } satisfies QuizQuestion;
      })
      .filter(
        (item: QuizQuestion | null): item is QuizQuestion => item !== null,
      );

    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [depth, setDepth] = useState<Depth>("medium");
  const [responseText, setResponseText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(
    null,
  );
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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
    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

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
      const safeRaw = raw || "No response was returned.";
      setResponseText(safeRaw);

      if (mode === "quiz") {
        const parsedQuestions = parseQuizQuestions(safeRaw);
        setQuizQuestions(parsedQuestions);
      }
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
    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function handleQuizAnswer(questionIndex: number, optionIndex: number) {
    if (quizSubmitted) {
      return;
    }
    setQuizAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
  }

  function submitQuiz() {
    if (!quizQuestions) {
      return;
    }

    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      setErrorText("Please answer all quiz questions before submitting.");
      return;
    }

    setErrorText("");
    setQuizSubmitted(true);
  }

  const quizScore = quizQuestions
    ? quizQuestions.reduce((score, question, index) => {
        return quizAnswers[index] === question.answerIndex ? score + 1 : score;
      }, 0)
    : 0;

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
                  onChange={(e) => {
                    setMode(e.target.value as Mode);
                    setResponseText("");
                    setErrorText("");
                    setQuizQuestions(null);
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
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
            ) : mode === "quiz" && quizQuestions ? (
              <div className="quiz-grid" aria-live="polite">
                {quizQuestions.map((question, questionIndex) => {
                  const selectedAnswer = quizAnswers[questionIndex];
                  const hasAnswered = selectedAnswer !== undefined;
                  const isCorrect = selectedAnswer === question.answerIndex;

                  return (
                    <article
                      className="quiz-card"
                      key={`${question.prompt}-${questionIndex}`}
                    >
                      <div className="quiz-card-head">
                        <span className="quiz-badge">Q{questionIndex + 1}</span>
                        <p>{question.prompt}</p>
                      </div>

                      <div className="quiz-options">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = selectedAnswer === optionIndex;
                          const isAnswer = optionIndex === question.answerIndex;

                          return (
                            <button
                              key={`${questionIndex}-${option}`}
                              type="button"
                              className={[
                                "quiz-option",
                                isSelected ? "selected" : "",
                                quizSubmitted && isAnswer ? "correct" : "",
                                quizSubmitted && isSelected && !isAnswer
                                  ? "wrong"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onClick={() =>
                                handleQuizAnswer(questionIndex, optionIndex)
                              }
                            >
                              <span>
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      <p
                        className={`quiz-feedback ${!quizSubmitted ? "idle" : isCorrect ? "correct" : "wrong"}`}
                      >
                        {!quizSubmitted
                          ? hasAnswered
                            ? "Selected. Submit quiz to see score."
                            : "Choose one option."
                          : isCorrect
                            ? `Correct.${question.explanation ? ` ${question.explanation}` : ""}`
                            : `Incorrect.${question.explanation ? ` ${question.explanation}` : ""}`}
                      </p>
                    </article>
                  );
                })}

                <div className="quiz-actions">
                  {!quizSubmitted ? (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={submitQuiz}
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <p className="quiz-score">
                      Score: {quizScore}/{quizQuestions.length}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={
                  responseText ? "response-text" : "response-text empty"
                }
              >
                {responseText ? (
                  <ReactMarkdown>{responseText}</ReactMarkdown>
                ) : (
                  "Your answer will appear here."
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

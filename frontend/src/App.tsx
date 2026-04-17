import { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080";

type Mode = "explain" | "teach" | "quiz" | "structure";

type Depth = "quick" | "medium" | "deep";

type QuizQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

type RoadmapStep = {
  title: string;
  relation: string;
  detail: string;
};

const quizQuestions: QuizQuestion[] = [
  {
    prompt: "What should a controller usually do?",
    options: [
      "Hold all business logic",
      "Handle requests and pass work to services",
      "Replace the database",
      "Only print logs",
    ],
    answerIndex: 1,
    explanation:
      "Controllers stay thin so the request flow is easier to read and test.",
  },
  {
    prompt: "Where should business rules usually live?",
    options: ["Service layer", "HTML files", "Console output", "CSS files"],
    answerIndex: 0,
    explanation:
      "Services keep the important logic away from routing and view code.",
  },
  {
    prompt: "What does structure mode focus on?",
    options: [
      "How pieces depend on each other",
      "Only the app title",
      "Random jokes",
      "Deleting comments",
    ],
    answerIndex: 0,
    explanation:
      "Structure mode should show relationships, dependencies, and flow.",
  },
  {
    prompt: "Why keep a fallback assistant?",
    options: [
      "So the app still works without a real AI key",
      "So the buttons look bigger",
      "To remove all errors forever",
      "To hide the mode selector",
    ],
    answerIndex: 0,
    explanation:
      "A fallback keeps the app useful while the real AI integration is missing.",
  },
  {
    prompt: "What should quiz mode do best?",
    options: [
      "Test understanding with quick questions",
      "Turn everything into a single paragraph",
      "Ignore the code",
      "Disable the response panel",
    ],
    answerIndex: 0,
    explanation:
      "Quiz mode should check understanding with short, relevant MCQs.",
  },
];

const structureRoadmap: RoadmapStep[] = [
  {
    title: "Input code",
    relation: "feeds into",
    detail:
      "The pasted snippet becomes the starting point for the analysis flow.",
  },
  {
    title: "Mode selection",
    relation: "routes to",
    detail:
      "Explain, teach, quiz, and structure decide which output style gets built.",
  },
  {
    title: "Prompt or preview builder",
    relation: "shapes",
    detail:
      "This is where the future AI or the hard-coded preview is assembled.",
  },
  {
    title: "Response panel",
    relation: "returns to",
    detail:
      "The result comes back to the UI as text, quiz cards, or a roadmap view.",
  },
  {
    title: "Future real AI",
    relation: "swaps in later",
    detail:
      "When the key exists, the local fallback can be replaced with a live model.",
  },
];

const exampleArchitectureFlow = `Architecture Flow Example:

1. Frontend Controller
   ├─ Receives user input (code, mode, depth)
   ├─ Validates the request
   └─ Sends payload to backend /analyze endpoint

2. Backend Layer
   ├─ AiService processes the request
   ├─ Checks for OPENAI_API_KEY environment variable
   ├─ Routes to local fallback (current) or future real AI
   └─ Builds response based on selected mode

3. Response Builder
   ├─ Explain mode → code summary + step-by-step breakdown
   ├─ Teach mode → core concepts + why they matter
   ├─ Quiz mode → 5 MCQs with feedback
   └─ Structure mode → architecture flow + layer details

4. UI Presentation
   ├─ Response text appears in the panel
   ├─ Mode-specific previews guide the user
   └─ Fallback messages provide context and humor

5. Future Integration Point
   └─ realAIPlaceholder() method ready for OpenAI swap`;

export default function App() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [depth, setDepth] = useState<Depth>("medium");
  const [showPreview, setShowPreview] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  function handleQuizAnswer(questionIndex: number, answerIndex: number) {
    setQuizAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answerIndex,
    }));
  }

  const quizScore = quizQuestions.reduce((score, question, index) => {
    return quizAnswers[index] === question.answerIndex ? score + 1 : score;
  }, 0);

  const responseTitle =
    mode === "quiz"
      ? "Fallback response"
      : mode === "structure"
        ? "Fallback roadmap text"
        : "Response";

  const responsePlaceholder =
    mode === "quiz"
      ? "Enable preview below to see the current hard-coded quiz experience."
      : mode === "structure"
        ? "Enable preview below to see the current hard-coded architecture flow."
        : "Your answer will appear here. The fallback assistant is ready when you are.";

  function renderModePreview() {
    if (mode === "quiz") {
      return (
        <section className="mode-preview quiz-preview">
          <div className="preview-header">
            <div>
              <p className="preview-kicker">Quiz preview</p>
              <h2>5 clickable MCQs</h2>
            </div>
            <span className="preview-chip">
              {quizScore}/{quizQuestions.length} correct
            </span>
          </div>

          <p className="preview-copy">
            This is the hard-coded version for now. When the real AI is wired
            in, this same area can show generated questions with the same click
            flow.
          </p>

          <div className="quiz-grid">
            {quizQuestions.map((question, questionIndex) => {
              const selectedAnswer = quizAnswers[questionIndex];
              const hasAnswered = selectedAnswer !== undefined;
              const isCorrect = selectedAnswer === question.answerIndex;

              return (
                <article className="quiz-card" key={question.prompt}>
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
                          key={option}
                          type="button"
                          className={[
                            "quiz-option",
                            isSelected ? "selected" : "",
                            hasAnswered && isAnswer ? "correct" : "",
                            hasAnswered && isSelected && !isAnswer
                              ? "wrong"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() =>
                            handleQuizAnswer(questionIndex, optionIndex)
                          }
                        >
                          <span>{String.fromCharCode(65 + optionIndex)}</span>
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <p
                    className={`quiz-feedback ${hasAnswered ? (isCorrect ? "correct" : "wrong") : "idle"}`}
                  >
                    {hasAnswered
                      ? isCorrect
                        ? `Correct. ${question.explanation}`
                        : `Not quite. ${question.explanation}`
                      : "Pick one answer to reveal the feedback."}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      );
    }

    if (mode === "structure") {
      return (
        <section className="mode-preview structure-preview">
          <div className="preview-header">
            <div>
              <p className="preview-kicker">Structure preview</p>
              <h2>How the pieces relate</h2>
            </div>
            <span className="preview-chip">No legacy code stress</span>
          </div>

          <p className="preview-copy">
            You don't have to decode legacy code yourself. Paste it here and the
            architecture flow will show you how the layers connect and what each
            part does. This roadmap is the template; the hard-coded example
            below is what you'll get once the real AI is connected.
          </p>

          <div className="architecture-example">
            <h3>Example Output</h3>
            <pre>{exampleArchitectureFlow}</pre>
          </div>

          <div className="roadmap">
            {structureRoadmap.map((step, stepIndex) => (
              <div className="roadmap-row" key={step.title}>
                <div className="roadmap-step">
                  <span className="roadmap-index">0{stepIndex + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </div>

                <span className="roadmap-relation">{step.relation}</span>

                {stepIndex < structureRoadmap.length - 1 ? (
                  <div className="roadmap-line" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      );
    }

    return null;
  }

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
          : "Could not reach the backend. The fallback assistant is still here when it comes back.",
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
    setQuizAnswers({});
  }


  return (
    <div className="app-shell">
      <main className="app-card">
        <section className="hero">
          <p className="eyebrow">CodeLens AI</p>
          <h1>Paste code, pick a mode, and get a clearer answer.</h1>
          <p className="hero-copy">
            A simple workspace for code explanations, concepts, quizzes, and
            architecture breakdown.
          </p>
          <p className="fallback-note">Local mode: no API key required.</p>
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
                    const nextMode = e.target.value as Mode;
                    setMode(nextMode);
                    setShowPreview(false);
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
                {loading ? "Analyzing…" : "Analyze"}
              </button>

              {(mode === "quiz" || mode === "structure") && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowPreview((current) => !current)}
                >
                  {showPreview ? "Hide preview" : "Show preview"}
                </button>
              )}
            </div>

            {loading ? (
              <p className="status loading">Analyzing your code...</p>
            ) : null}
            {errorText ? <p className="status error">{errorText}</p> : null}
          </form>

          <section className="panel response-panel" aria-live="polite">
            <div className="panel-header">
              <h2>{responseTitle}</h2>
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
            <pre
              className={responseText ? "response-text" : "response-text empty"}
            >
              {responseText || responsePlaceholder}
            </pre>
          </section>
        </div>

        {(mode === "quiz" || mode === "structure") && showPreview
          ? renderModePreview()
          : null}
      </main>
    </div>
  );
}

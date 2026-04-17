import { useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080";

type Mode = "explain" | "teach" | "quiz" | "structure";

type Depth = "quick" | "medium" | "deep";

type BannerKind = "idle" | "loading" | "error" | "success";

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

const fallbackCopy: Record<BannerKind, Record<Mode | "idle", string[]>> = {
  idle: {
    idle: [
      "Fallback mode is ready. Paste code and I’ll do my best with the budget of a snack drawer and the confidence of a senior engineer.",
      "No real AI key today, just a local code goblin with strong opinions and a decent chair.",
      "Drop in some code and the fallback assistant will try to be useful without pretending to be a moon landing.",
    ],
    explain: [
      "Explain mode is waiting. I’ll translate code into human before it starts asking for a manager.",
      "Explain mode loaded. The code will be decoded, gently, like a suspiciously long email.",
      "Explain selected. We are about to make the code sound less like a cryptic threat.",
    ],
    teach: [
      "Teach mode is standing by. Concepts first, syntax later, emotional damage minimized.",
      "Teach selected. I’ll explain the ideas behind the code so the compiler doesn’t get all the attention.",
      "Teach mode ready. We’re here for the why, not just the what.",
    ],
    quiz: [
      "Quiz mode is waiting. Three questions, no pop-up ads, and only a mild sense of judgment.",
      "Quiz selected. Time for three questions and one tiny existential crisis.",
      "Quiz mode ready. The questions will be relevant, unlike some meetings.",
    ],
    structure: [
      "Structure mode is loaded. We’re tracing the architecture before it starts freelancing.",
      "Structure selected. First we map the flow, then we pretend the code was always this organized.",
      "Architecture mode ready. Let’s see which layer is holding this whole thing together.",
    ],
  },
  loading: {
    idle: [
      "The local assistant is reading your code like a detective with three tabs open and one cold coffee.",
      "Working on it. This fallback AI is doing the hard part by refusing to panic.",
      "Please wait while the local code goblin performs a highly scientific analysis.",
    ],
    explain: [
      "Explain mode is thinking. It’s translating code into human without filing a formal complaint.",
      "The assistant is untangling the snippet one line at a time, which is rude but effective.",
      "Reading code now. This part always looks easier before the brackets show up.",
    ],
    teach: [
      "Teach mode is loading. Concepts are being organized into something less chaotic than the code itself.",
      "The assistant is prepping a lesson plan for your snippet. No chalk dust, just vibes.",
      "Teaching mode active. We are extracting the idea before the syntax gets too dramatic.",
    ],
    quiz: [
      "Quiz mode is loading. The questions are being assembled with a legally acceptable level of menace.",
      "Please wait. The quiz is being calibrated for relevance instead of pure chaos.",
      "Preparing three questions now. The code asked for feedback and, unfortunately, will receive it.",
    ],
    structure: [
      "Structure mode is loading. We are mapping the layers before anything tries to become a mystery novel.",
      "The assistant is tracing the flow so your architecture can stop improvising.",
      "Building the structure view now. Every layer deserves an alibi.",
    ],
  },
  error: {
    idle: [
      "That request tripped over its own shoelaces. The fallback assistant is still here and mildly disappointed.",
      "Something went sideways, but the local assistant is still on duty with a flashlight and a plan.",
      "The code did not cooperate. Bold move. We will recover.",
    ],
    explain: [
      "Explain mode hit a snag. The fallback assistant is still standing by, probably judging the stack trace in silence.",
      "The snippet fought back. I’m keeping the flashlight on and the explanation ready.",
      "Explain mode encountered turbulence. The local assistant is still making it through the cloud cover.",
    ],
    teach: [
      "Teach mode stumbled, but the concept engine is still alive and only slightly offended.",
      "The lesson plan got interrupted. We can still salvage the idea and the dignity.",
      "Teaching mode hit a pothole. The fallback assistant is checking the road before we continue.",
    ],
    quiz: [
      "Quiz mode glitched. Even the questions wanted a quick nap, but we can try again.",
      "The quiz request tangled itself. The assistant is untangling it like a developer on a Friday.",
      "Quiz mode failed politely. It’s still less dramatic than a production incident.",
    ],
    structure: [
      "Structure mode lost the map for a second. The assistant is still tracing the building plan.",
      "The architecture flow took a wrong turn, but the fallback assistant is back on the route.",
      "Structure mode hit a wall. Good news: walls are easier to diagram than they are to debug.",
    ],
  },
  success: {
    idle: [
      "Done. The fallback assistant has delivered a best-effort answer, which is still better than an empty commit message.",
      "Answer ready. Not magical, but it does the job without asking for enterprise pricing.",
      "Your response is in. The local assistant has spoken, and it only charged you in CPU cycles.",
    ],
    explain: [
      "Explain mode delivered. We turned the code from mysterious to merely slightly suspicious.",
      "Explanation ready. The code is now human-readable and only mildly haunted.",
      "Explain done. The snippet has been translated into something your future self can pretend to understand.",
    ],
    teach: [
      "Teach mode delivered. Concepts are now less slippery and more useful.",
      "Lesson complete. The idea behind the code is now visible through the fog.",
      "Teach done. We extracted the brain from the boilerplate.",
    ],
    quiz: [
      "Quiz ready. Three questions, three chances to feel annoyingly informed.",
      "Quiz mode delivered. The code has been politely interrogated.",
      "Questions generated. No trickery, just enough pressure to make the lesson stick.",
    ],
    structure: [
      "Structure ready. The architecture has been mapped before it could wander off.",
      "Flow complete. We found the layers and they have been asked to behave.",
      "Structure delivered. The codebase now has a clearer walking path.",
    ],
  },
};

function pickFallbackMessage(kind: BannerKind, mode: Mode | "idle") {
  const messages = fallbackCopy[kind][mode];
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function App() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [depth, setDepth] = useState<Depth>("medium");
  const [responseText, setResponseText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [fallbackMessage, setFallbackMessage] = useState(() =>
    pickFallbackMessage("idle", "idle"),
  );

  function updateFallbackMessage(kind: BannerKind, nextMode: Mode = mode) {
    setFallbackMessage(pickFallbackMessage(kind, nextMode));
  }

  function handleQuizAnswer(questionIndex: number, answerIndex: number) {
    setQuizAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answerIndex,
    }));
    updateFallbackMessage("success", "quiz");
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
      ? "The quiz preview above is the main experience here for now. The backend will later generate these questions automatically."
      : mode === "structure"
        ? "The roadmap preview above is the main experience here for now. The backend will later map the relationships automatically."
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
      setErrorText(
        "Paste some code first so the local code goblin has something to inspect.",
      );
      setResponseText("");
      updateFallbackMessage("error");
      return;
    }

    setLoading(true);
    setResponseText("");
    setErrorText("");
    updateFallbackMessage("loading");

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
      updateFallbackMessage("success");
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Could not reach the backend. The fallback assistant is still here when it comes back.",
      );
      updateFallbackMessage("error");
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

        <section className="fallback-banner" aria-live="polite">
          <span className="fallback-pill">Fallback mode</span>
          <p>{fallbackMessage}</p>
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
                  onChange={(e) => {
                    const nextMode = e.target.value as Mode;
                    setMode(nextMode);
                    updateFallbackMessage("idle", nextMode);
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
            </div>

            {loading ? (
              <p className="status loading">
                Working on it... the local assistant is pretending to be a very
                serious professional while reading your code.
              </p>
            ) : null}
            {errorText ? <p className="status error">{errorText}</p> : null}
          </form>

          <section className="panel response-panel" aria-live="polite">
            <div className="panel-header">
              <h2>{responseTitle}</h2>
            </div>
            <pre
              className={responseText ? "response-text" : "response-text empty"}
            >
              {responseText || responsePlaceholder}
            </pre>
          </section>
        </div>

        {renderModePreview()}
      </main>
    </div>
  );
}

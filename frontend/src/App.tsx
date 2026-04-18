import { useState } from "react";
import type { Mode, Depth, QuizQuestion } from "./types";
import { parseQuizQuestions } from "./utils";
import { EditorPanel } from "./components/EditorPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import "./index.css";

const API_BASE = "http://localhost:8080";

const App = () => {
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
      ? "Generating quiz"
      : mode === "structure"
        ? "Generating architecture"
        : "Generating response";

  const handleSubmit = async () => {
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
  };

  const copyToClipboard = () =>
    responseText && navigator.clipboard.writeText(responseText);

  const clearCode = () => {
    setCode("");
    setResponseText("");
    setErrorText("");
    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) {
      return;
    }
    setQuizAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
  };

  const submitQuiz = () => {
    if (!quizQuestions) {
      return;
    }

    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      setErrorText("Please answer all quiz questions before submitting.");
      return;
    }

    setErrorText("");
    setQuizSubmitted(true);
  };

  const quizScore = quizQuestions
    ? quizQuestions.reduce(
        (score, question, index) =>
          quizAnswers[index] === question.answerIndex ? score + 1 : score,
        0,
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl bg-slate-900 p-8 border border-slate-800 shadow-2xl">
          <section className="mb-8">
            <h1 className="text-5xl font-bold text-cyan-400 mb-2">
              CodeLens AI
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Paste code, pick a mode, and get a clear answer.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <EditorPanel
                code={code}
                mode={mode}
                depth={depth}
                loading={loading}
                errorText={errorText}
                onCodeChange={setCode}
                onModeChange={setMode}
                onDepthChange={setDepth}
                onClear={clearCode}
                onSubmit={handleSubmit}
              />
            </div>

            <div className="lg:col-span-2">
              <ResponsePanel
                loading={loading}
                mode={mode}
                responseText={responseText}
                quizQuestions={quizQuestions}
                quizAnswers={quizAnswers}
                quizSubmitted={quizSubmitted}
                onSelectAnswer={handleQuizAnswer}
                onSubmitQuiz={submitQuiz}
                onCopy={copyToClipboard}
                loadingLabel={loadingLabel}
                quizScore={quizScore}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

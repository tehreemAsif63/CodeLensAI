import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Mode, QuizQuestion } from "../types";
import { QuizCard } from "./QuizCard";

interface ResponsePanelProps {
  loading: boolean;
  mode: Mode;
  responseText: string;
  quizQuestions: QuizQuestion[] | null;
  quizAnswers: Record<number, number>;
  quizSubmitted: boolean;
  onSelectAnswer: (questionIndex: number, optionIndex: number) => void;
  onSubmitQuiz: () => void;
  onCopy: () => void;
  loadingLabel: string;
  quizScore: number;
}

export const ResponsePanel = ({
  loading,
  mode,
  responseText,
  quizQuestions,
  quizAnswers,
  quizSubmitted,
  onSelectAnswer,
  onSubmitQuiz,
  onCopy,
  loadingLabel,
  quizScore,
}: ResponsePanelProps) => {
  return (
    <section
      className="flex flex-col gap-4 p-6 rounded-xl border border-slate-700 bg-slate-800 shadow-lg sticky top-5 h-fit"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-cyan-400">Response</h2>
        {loading && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-slate-600 bg-slate-700 text-slate-100 text-xs font-semibold rounded-full">
            <div className="w-3 h-3 rounded-full border-2 border-cyan-500 border-t-cyan-300 animate-spin" />
            {loadingLabel}
          </div>
        )}
        {responseText && !loading && (
          <button
            type="button"
            className="px-3 py-1.5 text-sm font-medium text-cyan-400 border border-slate-600 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            onClick={onCopy}
            title="Copy to clipboard"
          >
            Copy
          </button>
        )}
      </div>

      {loading ? (
        <div
          className="min-h-72 flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-slate-900 border border-slate-700"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-cyan-300 animate-spin" />
            <strong className="text-slate-100">{loadingLabel}...</strong>
          </div>
          <p className="text-sm text-slate-400">
            Analyzing your code and preparing a helpful answer.
          </p>
          <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 animate-pulse" />
          </div>
        </div>
      ) : mode === "quiz" && quizQuestions ? (
        <div className="flex flex-col gap-4" aria-live="polite">
          {quizQuestions.map((question, questionIndex) => (
            <QuizCard
              key={`${question.prompt}-${questionIndex}`}
              question={question}
              questionIndex={questionIndex}
              selectedAnswer={quizAnswers[questionIndex]}
              isSubmitted={quizSubmitted}
              onSelectAnswer={(optionIndex) =>
                onSelectAnswer(questionIndex, optionIndex)
              }
            />
          ))}

          <div className="flex items-center gap-3 pt-2">
            {!quizSubmitted ? (
              <button
                type="button"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                onClick={onSubmitQuiz}
              >
                Submit Quiz
              </button>
            ) : (
              <p className="px-4 py-2.5 rounded-lg bg-green-500/20 text-green-300 font-bold border border-green-600">
                Score: {quizScore}/{quizQuestions.length}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`min-h-72 p-6 rounded-lg border border-slate-700 overflow-auto ${
            responseText
              ? "bg-slate-900"
              : "flex items-center justify-center bg-slate-900 text-slate-500 italic"
          }`}
        >
          {responseText ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {responseText}
              </ReactMarkdown>
            </div>
          ) : (
            "Your answer will appear here."
          )}
        </div>
      )}
    </section>
  );
};

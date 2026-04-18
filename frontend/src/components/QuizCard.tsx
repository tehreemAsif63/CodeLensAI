import type { QuizQuestion } from "../types";

interface QuizCardProps {
  question: QuizQuestion;
  questionIndex: number;
  selectedAnswer: number | undefined;
  isSubmitted: boolean;
  onSelectAnswer: (optionIndex: number) => void;
}

export const QuizCard = ({
  question,
  questionIndex,
  selectedAnswer,
  isSubmitted,
  onSelectAnswer,
}: QuizCardProps) => {
  const hasAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === question.answerIndex;

  return (
    <article className="p-4 rounded-xl border border-slate-700 bg-slate-800">
      <div className="flex gap-3 items-start mb-3">
        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-cyan-600 text-white text-sm font-bold">
          Q{questionIndex + 1}
        </span>
        <p className="text-slate-100 font-medium leading-relaxed">
          {question.prompt}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === optionIndex;
          const isAnswer = optionIndex === question.answerIndex;

          let buttonClass =
            "flex items-center gap-3 w-full px-3.5 py-3 text-left border rounded-lg transition-all ";

          if (isSubmitted && isAnswer) {
            buttonClass +=
              "border-green-500 bg-green-500/20 text-green-100 font-medium";
          } else if (isSubmitted && isSelected && !isAnswer) {
            buttonClass +=
              "border-red-500 bg-red-500/20 text-red-100 font-medium";
          } else if (isSelected) {
            buttonClass +=
              "border-cyan-500 bg-cyan-500/30 text-cyan-100 font-semibold";
          } else {
            buttonClass +=
              "border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:-translate-y-0.5";
          }

          return (
            <button
              key={`${questionIndex}-${option}`}
              type="button"
              className={buttonClass}
              onClick={() => onSelectAnswer(optionIndex)}
              disabled={isSubmitted}
            >
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-cyan-300">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <p
        className={`mt-3 text-sm font-medium leading-relaxed ${
          !isSubmitted
            ? "text-slate-400"
            : isCorrect
              ? "text-green-400"
              : "text-red-400"
        }`}
      >
        {!isSubmitted
          ? hasAnswered
            ? "Selected. Submit quiz to see score."
            : "Choose one option."
          : isCorrect
            ? `Correct.${question.explanation ? ` ${question.explanation}` : ""}`
            : `Incorrect.${question.explanation ? ` ${question.explanation}` : ""}`}
      </p>
    </article>
  );
};

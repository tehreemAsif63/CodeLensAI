import type { QuizQuestion } from "./types";

export function extractJsonBlock(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }
  return raw.trim();
}

export function parseQuizQuestions(raw: string): QuizQuestion[] | null {
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

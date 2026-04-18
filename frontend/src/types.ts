export type Mode = "explain" | "teach" | "quiz" | "structure";
export type Depth = "quick" | "medium" | "deep";

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

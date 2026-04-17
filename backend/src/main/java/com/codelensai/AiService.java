package com.codelensai;

import java.util.Locale;

import org.springframework.stereotype.Service;

@Service
public class AiService {
    public String analyze(AnalyzeRequest request) {
        AnalyzeRequest safeRequest = request == null ? new AnalyzeRequest("", "", "") : request;
        String apiKey = System.getenv("OPENAI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            return fakeAIResponse(safeRequest);
        }

        return realAIPlaceholder(safeRequest);
    }

    private String fakeAIResponse(AnalyzeRequest request) {
        String code = normalize(request.code());
        String mode = normalize(request.mode());
        String depth = normalize(request.depth());
        String combined = (mode + "\n" + depth + "\n" + code).toLowerCase(Locale.ROOT);

        if (looksLikeCodeExplanationRequest(combined, mode)) {
            return explainCode(code, depth);
        }

        if (containsAny(combined, "hello", "hi", "hey")) {
            return friendlyGreeting();
        }

        if (containsAny(combined, "error", "exception", "bug", "fail")) {
            return debuggingAdvice(code, depth);
        }

        if (combined.contains("spring")) {
            return springBootTips(depth);
        }

        if (combined.contains("code")) {
            return codingGuidance(code, depth);
        }

        return defaultHelpfulResponse(code, mode, depth);
    }

    private String realAIPlaceholder(AnalyzeRequest request) {
        return fakeAIResponse(request);
    }

    private boolean looksLikeCodeExplanationRequest(String combined, String mode) {
        return "explain".equalsIgnoreCase(mode) || combined.contains("explain code") || combined.contains("explain");
    }

    private String explainCode(String code, String depth) {
        String summary = code.isBlank()
                ? "No code was provided yet. Paste a snippet and I can explain it line by line."
                : summarizeCode(code);

        String detailLevel = "deep".equalsIgnoreCase(depth)
                ? "I’ll break the logic into smaller pieces and focus on why each step matters."
                : "I’ll keep this high-level and easy to scan.";

        return "What this code does:\n"
                + summary + "\n\n"
                + "Step-by-step breakdown:\n"
                + "1. Identify the main entry point, such as a class, method, or function.\n"
                + "2. Follow the input checks, transformations, and return values.\n"
                + "3. Look for side effects like database calls, API calls, or state changes.\n"
                + "4. Trace how the result is produced from start to finish.\n\n"
                + "Simple language:\n"
                + detailLevel;
    }

    private String friendlyGreeting() {
        return "Hello. I’m ready to help you read code, debug issues, or explain Spring Boot patterns. If you paste a snippet, I’ll break it down clearly.";
    }

    private String debuggingAdvice(String code, String depth) {
        String focus = "deep".equalsIgnoreCase(depth)
                ? "Start by tracing the error path, checking logs, and reproducing the issue with the smallest possible input."
                : "Start with the most likely failure point and verify the input, logs, and recent code changes.";

        return "Debugging steps:\n"
                + "1. Reproduce the error consistently.\n"
                + "2. Check logs and the exact stack trace.\n"
                + "3. Validate inputs, null values, and environment variables.\n"
                + "4. Compare the failing path with the last known working version.\n"
                + "5. Add a small test or temporary print to isolate the problem.\n\n"
                + focus + (code.isBlank() ? "" : "\n\nIf you share the code, I can point to the likely failure points directly.");
    }

    private String springBootTips(String depth) {
        String detail = "deep".equalsIgnoreCase(depth)
                ? "In Spring Boot, keep controllers thin, push logic into services, and let configuration stay in properties or environment variables."
                : "Keep controllers thin and move business logic into services.";

        return "Spring Boot tips:\n"
                + "1. Use `@RestController` for request handling and keep it light.\n"
                + "2. Put business rules in `@Service` classes.\n"
                + "3. Handle errors centrally with `@RestControllerAdvice`.\n"
                + "4. Prefer constructor injection for clarity and testability.\n\n"
                + detail;
    }

    private String codingGuidance(String code, String depth) {
        String detail = "deep".equalsIgnoreCase(depth)
                ? "If you want, I can turn the snippet into a step-by-step walkthrough or suggest a cleaner refactor."
                : "If you want, paste the snippet and I’ll explain the key moving parts.";

        return "Coding guidance:\n"
                + "1. Identify the inputs and outputs first.\n"
                + "2. Separate data handling from business logic.\n"
                + "3. Keep functions small enough to test directly.\n"
                + "4. Add edge-case handling for empty or invalid input.\n\n"
                + detail + (code.isBlank() ? "" : "\n\nI can also review the exact code if you paste it in.");
    }

    private String defaultHelpfulResponse(String code, String mode, String depth) {
        String promptSummary = code.isBlank()
                ? "No code was provided."
                : "I received your code snippet and can help analyze it.";

        return promptSummary + " Helpful next step: tell me whether you want an explanation, a refactor, debugging help, or a Spring Boot review.";
    }

    private String summarizeCode(String code) {
        String normalized = code.toLowerCase(Locale.ROOT);

        if (normalized.contains("class ")) {
            return "This looks like a class-based snippet that defines structure and behavior around a focused piece of application logic.";
        }

        if (normalized.contains("interface ")) {
            return "This appears to define an interface, which usually describes a contract other classes must follow.";
        }

        if (normalized.contains("if (") || normalized.contains("switch ")) {
            return "This code uses conditional logic to choose different paths based on the current input or state.";
        }

        if (normalized.contains("for (") || normalized.contains("while ")) {
            return "This snippet includes looping logic that repeats work over a collection or until a condition changes.";
        }

        if (normalized.contains("try") || normalized.contains("catch")) {
            return "This code includes error handling so it can recover from failures or report them cleanly.";
        }

        if (normalized.contains("return ")) {
            return "This snippet computes a value and returns the result to the caller.";
        }

        return "This code performs a focused task and likely transforms input into output step by step.";
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}
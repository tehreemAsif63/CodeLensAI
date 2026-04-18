package com.codelensai;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiService {
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final String mistralApiKey;
    private final String mistralApiUrl;
    private final String mistralModel;

    public AiService(
            org.springframework.web.client.RestTemplate restTemplate,
            @Value("${mistral.api.key:}") String mistralApiKey,
            @Value("${mistral.api.url:https://api.mistral.ai/v1/chat/completions}") String mistralApiUrl,
            @Value("${mistral.model:mistral-small-latest}") String mistralModel) {
        this.restTemplate = restTemplate;
        this.mistralApiKey = mistralApiKey;
        this.mistralApiUrl = mistralApiUrl;
        this.mistralModel = mistralModel;
    }

    public String analyze(AnalyzeRequest request) {
        AnalyzeRequest safeRequest = request == null ? new AnalyzeRequest("", "", "") : request;
        String mistralKey = mistralApiKey == null ? "" : mistralApiKey.trim();

        if (mistralKey != null && !mistralKey.isBlank()) {
            try {
                return callMistralAPI(safeRequest, mistralKey);
            } catch (Exception e) {
                System.err.println("Mistral API error, falling back to local: " + e.getMessage());
                return "Sorry, no answer fetched from AI right now. Please try again.";
            }
        }

        return fakeAIResponse(safeRequest);
    }

    private String callMistralAPI(AnalyzeRequest request, String apiKey) {
        
        String prompt = buildPrompt(request);

        var messages = java.util.List.of(
            new MistralRequest.MistralMessage("user", prompt)
        );
        var mistralRequest = new MistralRequest(mistralModel, messages, 1000);
        
        var headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        
        var httpEntity = new org.springframework.http.HttpEntity<>(mistralRequest, headers);
        
        try {
            var response = restTemplate.postForObject(
                mistralApiUrl,
                httpEntity,
                MistralResponse.class
            );
            
            if (response != null && response.choices().length > 0) {
                return response.choices()[0].message().content();
            }
            return "No response from Mistral API.";
        } catch (Exception e) {
            throw new RuntimeException("Mistral API call failed: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(AnalyzeRequest request) {
        String mode = normalize(request.mode());
        String depth = normalize(request.depth());
        String code = request.code() == null ? "" : request.code();

        String modeInstruction = switch (mode) {
            case "explain" -> "Explain this code clearly in simple terms.";
            case "teach" -> "Teach me the key concepts in this code.";
            case "quiz" -> "Generate 5 quiz questions about this code.";
            case "structure" -> "Explain the architecture and flow of this code and ideally draw it to show how it connects.";
            default -> "Analyze this code.";
        };
        
        String depthInstruction = switch (depth) {
            case "quick" -> " Keep it brief and to the point.";
            case "deep" -> " Provide detailed, in-depth analysis.";
            default -> " Provide a balanced explanation.";
        };
        
        return modeInstruction + depthInstruction + "\n\nCode:\n" + code;
    }

    private String fakeAIResponse(AnalyzeRequest request) {
        String code = normalize(request.code());
        if (code.isBlank()) {
            return "Sorry, no answer fetched. Please paste code and try again.";
        }

        return "Sorry, no live AI answer fetched. Check API key and try again.";
    }

    private String renderModeResponse(PromptMode mode, String code, String depth) {
        return switch (mode) {
            case EXPLAIN -> explainCode(code, depth);
            case TEACH -> teachConcepts(code, depth);
            case QUIZ -> generateQuiz(code, depth);
            case STRUCTURE -> explainArchitectureFlow(code, depth);
            case DEFAULT -> defaultHelpfulResponse(code, mode.value, depth);
        };
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

            private String teachConcepts(String code, String depth) {
                String intro = switch (normalize(depth)) {
                    case "quick" -> "Memorize this: input -> validate -> process -> output. That's it.";
                    case "deep" -> "I'll explain the core concepts, why they matter, and how they apply to different code patterns.";
                    default -> "I'll keep the concept list short and practical.";
                };

            return "Concepts you need:\n"
                + "1. Separate responsibilities so each part has one job.\n"
                + "2. Follow input -> processing -> output.\n"
                + "3. Keep state changes predictable.\n"
                + "4. Use frameworks like Spring to organize code cleanly.\n\n"
                + intro + (code.isBlank() ? "" : "\n\nThe provided code can be used as the example once you paste it in.");
            }

            private String generateQuiz(String code, String depth) {
            String questionStyle = switch (normalize(depth)) {
                case "quick" -> "These are rapid-fire checks to confirm you can explain the code in one sentence.";
                case "deep" -> "These questions focus on understanding edge cases, dependencies, and potential refactors.";
                default -> "These are quick checks to confirm basic understanding.";
            };

            return "Quiz mode:\n"
                + "1. What is the main purpose of this code?\n"
                + "2. Which part is responsible for the main logic flow?\n"
                + "3. What would happen if the input were empty or invalid?\n\n"
                + questionStyle + (code.isBlank() ? "" : "\n\nIf you share the code, I can tailor the 3 questions to it.");
            }

            private String explainArchitectureFlow(String code, String depth) {
            String detail = switch (normalize(depth)) {
                case "quick" -> "Quick flow: request → handler → service → response. Done.";
                case "deep" -> "I'll describe how data flows through each layer, including dependency injection, error handling, and state management.";
                default -> "I'll keep the flow simple and focused on the main layers.";
            };

            return "Architecture flow:\n"
                + "1. The controller receives the request.\n"
                + "2. The service builds the response logic.\n"
                + "3. The backend decides whether to use the local fallback or future AI path.\n"
                + "4. The final text is returned to the UI.\n\n"
                + detail + (code.isBlank() ? "" : "\n\nThe supplied code can be used to map the exact flow once it is included.");
            }

    private String friendlyGreeting() {
        return "Hello. I’m ready to help you read code, debug issues, or explain Spring Boot patterns. If you paste a snippet, I’ll break it down clearly.";
    }

    private String debuggingAdvice(String code, String depth) {
        String focus = switch (normalize(depth)) {
            case "quick" -> "Quick fix: check logs, verify input, isolate the error. Done.";
            case "deep" -> "Start by tracing the error path, checking logs, reproducing with the smallest possible input, and examining stack traces carefully.";
            default -> "Start with the most likely failure point and verify the input, logs, and recent code changes.";
        };

        return "Debugging steps:\n"
                + "1. Reproduce the error consistently.\n"
                + "2. Check logs and the exact stack trace.\n"
                + "3. Validate inputs, null values, and environment variables.\n"
                + "4. Compare the failing path with the last known working version.\n"
                + "5. Add a small test or temporary print to isolate the problem.\n\n"
                + focus + (code.isBlank() ? "" : "\n\nIf you share the code, I can point to the likely failure points directly.");
    }

    private String springBootTips(String depth) {
        String detail = switch (normalize(depth)) {
            case "quick" -> "Three rules: controllers are thin, services hold logic, config stays external.";
            case "deep" -> "In Spring Boot, understand dependency injection deeply, configure via profiles, test with TestContext, and leverage autoconfiguration wisely.";
            default -> "Keep controllers thin and move business logic into services.";
        };

        return "Spring Boot tips:\n"
                + "1. Use `@RestController` for request handling and keep it light.\n"
                + "2. Put business rules in `@Service` classes.\n"
                + "3. Handle errors centrally with `@RestControllerAdvice`.\n"
                + "4. Prefer constructor injection for clarity and testability.\n\n"
                + detail;
    }

    private String codingGuidance(String code, String depth) {
        String detail = switch (normalize(depth)) {
            case "quick" -> "Input, process, output. That's the pattern. Keep it simple.";
            case "deep" -> "If you want, I can turn the snippet into a comprehensive refactor guide with testability improvements and potential architectural changes.";
            default -> "If you want, paste the snippet and I'll explain the key moving parts.";
        };

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

    private enum PromptMode {
        EXPLAIN("explain"),
        TEACH("teach"),
        QUIZ("quiz"),
        STRUCTURE("structure"),
        DEFAULT("");

        private final String value;

        PromptMode(String value) {
            this.value = value;
        }

        private static PromptMode from(String mode) {
            String normalizedMode = mode == null ? "" : mode.trim().toLowerCase(Locale.ROOT);

            for (PromptMode promptMode : values()) {
                if (promptMode.value.equals(normalizedMode)) {
                    return promptMode;
                }
            }

            return DEFAULT;
        }
    }
}